package com.officeflow.controller;

import com.officeflow.dto.UserDtos.CreateUserRequest;
import com.officeflow.dto.UserDtos.OffboardUserRequest;
import com.officeflow.model.AppUser;
import com.officeflow.model.ProjectMember;
import com.officeflow.model.ProjectMemberRole;
import com.officeflow.model.Task;
import com.officeflow.model.UserRole;
import com.officeflow.repository.AppUserRepository;
import com.officeflow.repository.ProjectMemberRepository;
import com.officeflow.repository.TaskRepository;
import com.officeflow.service.AdminAccessService;
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
    private final AdminAccessService adminAccessService;

    public UserController(
            AppUserRepository userRepository,
            TaskRepository taskRepository,
            ProjectMemberRepository memberRepository,
            PasswordEncoder passwordEncoder,
            AdminAccessService adminAccessService) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminAccessService = adminAccessService;
    }

    @GetMapping
    public List<AppUser> list() {
        return userRepository.findByActiveTrueOrderByNameAsc();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public AppUser create(@Valid @RequestBody CreateUserRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A user with this email already exists");
        }

        AppUser user = new AppUser();
        user.setName(request.name());
        user.setDesignation(request.designation());
        user.setEmail(email);
        user.setRole(adminAccessService.isAdminEmail(email) ? UserRole.ADMIN : UserRole.MEMBER);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        return userRepository.save(user);
    }

    @PostMapping("/{userId}/offboard")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasRole('ADMIN')")
    public Object offboard(@PathVariable Long userId, @RequestBody OffboardUserRequest request) {
        AppUser leavingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (!leavingUser.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is already inactive");
        }

        List<Task> assignedTasks = taskRepository.findByAssigneeId(userId);
        AppUser replacement = null;
        if (!assignedTasks.isEmpty()) {
            if (request == null || request.reassignToUserId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a replacement user for assigned tasks");
            }
            if (request.reassignToUserId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Replacement user must be different");
            }
            replacement = userRepository.findById(request.reassignToUserId())
                    .filter(AppUser::isActive)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Replacement user not found"));
            for (Task task : assignedTasks) {
                task.setAssignee(replacement);
                ensureProjectMember(task, replacement);
            }
            taskRepository.saveAll(assignedTasks);
        }

        memberRepository.findByUserId(userId).forEach(memberRepository::delete);
        leavingUser.setActive(false);
        userRepository.save(leavingUser);
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
