package com.flowos.controller;

import com.flowos.dto.UserDtos.CreateUserRequest;
import com.flowos.dto.UserDtos.OffboardUserRequest;
import com.flowos.model.AppUser;
import com.flowos.model.ProjectMember;
import com.flowos.model.ProjectMemberRole;
import com.flowos.model.Task;
import com.flowos.model.UserRole;
import com.flowos.repository.AppUserRepository;
import com.flowos.repository.ProjectMemberRepository;
import com.flowos.repository.TaskRepository;
import com.flowos.service.AuditService;
import com.flowos.service.CurrentUserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final AppUserRepository userRepository;
    private final TaskRepository taskRepository;
    private final ProjectMemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUserService currentUserService;
    private final AuditService auditService;

    public UserController(
            AppUserRepository userRepository,
            TaskRepository taskRepository,
            ProjectMemberRepository memberRepository,
            PasswordEncoder passwordEncoder,
            CurrentUserService currentUserService,
            AuditService auditService) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
        this.currentUserService = currentUserService;
        this.auditService = auditService;
    }

    @GetMapping
    public List<AppUser> list() {
        AppUser currentUser = currentUserService.get();
        return userRepository.findByOrganizationIdAndActiveTrueOrderByNameAsc(currentUser.getOrganization().getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public AppUser create(@Valid @RequestBody CreateUserRequest request) {
        AppUser currentUser = currentUserService.get();
        String email = normalizeEmail(request.email());
        if (userRepository.existsByOrganizationIdAndEmail(currentUser.getOrganization().getId(), email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A user with this email already exists");
        }

        AppUser user = new AppUser();
        user.setOrganization(currentUser.getOrganization());
        user.setName(request.name());
        user.setDesignation(request.designation());
        user.setEmail(email);
        user.setRole(request.role() == null ? UserRole.MEMBER : request.role());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        AppUser saved = userRepository.save(user);
        auditService.record(currentUser.getOrganization(), currentUser, "user.created", "user", saved.getId(), "User created: " + saved.getEmail() + " as " + saved.getRole());
        return saved;
    }

    @PostMapping("/{userId}/offboard")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasRole('ADMIN')")
    public Object offboard(@PathVariable Long userId, @RequestBody OffboardUserRequest request) {
        AppUser leavingUser = userRepository.findById(userId)
                .filter(candidate -> candidate.getOrganization().getId().equals(currentUserService.get().getOrganization().getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (!leavingUser.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is already inactive");
        }

        List<Task> assignedTasks = taskRepository.findByProjectOrganizationIdAndAssigneeId(leavingUser.getOrganization().getId(), userId);
        AppUser replacement = null;
        if (!assignedTasks.isEmpty()) {
            if (request == null || request.reassignToUserId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a replacement user for assigned tasks");
            }
            if (request.reassignToUserId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Replacement user must be different");
            }
            replacement = userRepository.findById(request.reassignToUserId())
                    .filter(candidate -> candidate.getOrganization().getId().equals(leavingUser.getOrganization().getId()))
                    .filter(AppUser::isActive)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Replacement user not found"));
            for (Task task : assignedTasks) {
                task.setAssignee(replacement);
                ensureProjectMember(task, replacement);
            }
            taskRepository.saveAll(assignedTasks);
        }

        memberRepository.findByProjectOrganizationIdAndUserId(leavingUser.getOrganization().getId(), userId).forEach(memberRepository::delete);
        leavingUser.setActive(false);
        userRepository.save(leavingUser);
        AppUser actor = currentUserService.get();
        String replacementDetail = replacement == null ? "No reassignment required" : "Reassigned to " + replacement.getEmail();
        auditService.record(leavingUser.getOrganization(), actor, "user.offboarded", "user", leavingUser.getId(), "User removed: " + leavingUser.getEmail() + ". " + replacementDetail + ". Tasks: " + assignedTasks.size());
        return java.util.Map.of("message", "User removed from active team", "reassignedTasks", assignedTasks.size());
    }

    private void ensureProjectMember(Task task, AppUser replacement) {
        ProjectMember member = memberRepository.findByProjectIdAndUserId(task.getProject().getId(), replacement.getId()).orElseGet(ProjectMember::new);
        member.setProject(task.getProject());
        member.setUser(replacement);
        if (member.getRole() == null) {
            member.setRole(ProjectMemberRole.MEMBER);
        }
        memberRepository.save(member);
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
