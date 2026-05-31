package com.flowos.controller;

import com.flowos.dto.ProjectDtos.CreateProjectRequest;
import com.flowos.dto.ProjectDtos.ProjectMemberRequest;
import com.flowos.dto.ProjectDtos.ProjectMembersResponse;
import com.flowos.dto.ProjectDtos.ProjectSummary;
import com.flowos.model.AppUser;
import com.flowos.model.ProjectMember;
import com.flowos.model.Project;
import com.flowos.model.TaskStatus;
import com.flowos.repository.AppUserRepository;
import com.flowos.repository.ProjectMemberRepository;
import com.flowos.repository.ProjectRepository;
import com.flowos.repository.TaskRepository;
import com.flowos.service.AccessService;
import com.flowos.service.AuditService;
import com.flowos.service.CurrentUserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final ProjectMemberRepository memberRepository;
    private final AppUserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final AccessService accessService;
    private final AuditService auditService;

    public ProjectController(
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            ProjectMemberRepository memberRepository,
            AppUserRepository userRepository,
            CurrentUserService currentUserService,
            AccessService accessService,
            AuditService auditService) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
        this.accessService = accessService;
        this.auditService = auditService;
    }

    @GetMapping
    public List<ProjectSummary> list() {
        AppUser user = currentUserService.get();
        List<Project> projects = visibleProjects(user);
        return projects.stream().map(project -> toSummary(project, user)).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public Project create(@Valid @RequestBody CreateProjectRequest request) {
        AppUser owner = currentUserService.get();
        Project project = new Project();
        project.setName(request.name());
        project.setDescription(request.description());
        project.setClientName(request.clientName());
        project.setWorkType(request.workType() == null ? com.flowos.model.ProjectWorkType.GENERAL : request.workType());
        project.setConfidentialityLevel(request.confidentialityLevel() == null ? com.flowos.model.ConfidentialityLevel.STANDARD : request.confidentialityLevel());
        project.setBillingType(request.billingType() == null ? com.flowos.model.BillingType.NON_BILLABLE : request.billingType());
        project.setExternalReference(request.externalReference());
        project.setOrganization(owner.getOrganization());
        project.setOwner(owner);
        Project saved = projectRepository.save(project);
        upsertProjectMember(saved, owner, com.flowos.model.ProjectMemberRole.TEAM_LEAD);
        auditService.record(owner.getOrganization(), owner, "project.created", "project", saved.getId(), "Project created: " + saved.getName());
        return saved;
    }

    @GetMapping("/{projectId}/tasks")
    public Object tasks(@PathVariable Long projectId) {
        AppUser user = currentUserService.get();
        Project project = findProjectForUser(projectId, user);
        accessService.requireProjectView(user, project);
        return accessService.isAdmin(user) || accessService.isTeamLead(user, projectId)
                ? taskRepository.findByProjectIdOrderByUpdatedAtDesc(projectId)
                : taskRepository.findByProjectIdAndAssigneeIdOrderByUpdatedAtDesc(projectId, user.getId());
    }

    @GetMapping("/{projectId}/members")
    public ProjectMembersResponse members(@PathVariable Long projectId) {
        AppUser user = currentUserService.get();
        Project project = findProjectForUser(projectId, user);
        accessService.requireProjectView(user, project);
        return new ProjectMembersResponse(memberRepository.findByProjectIdOrderByUserNameAsc(projectId));
    }

    @PostMapping("/{projectId}/members")
    public ProjectMember addMember(@PathVariable Long projectId, @Valid @RequestBody ProjectMemberRequest request) {
        AppUser user = currentUserService.get();
        accessService.requireProjectMemberManagement(user, projectId);
        Project project = findProjectForUser(projectId, user);
        AppUser member = userRepository.findByOrganizationIdAndId(user.getOrganization().getId(), request.userId()).orElseThrow(() -> new EntityNotFoundException("User not found"));
        ProjectMember saved = upsertProjectMember(project, member, request.role());
        auditService.record(user.getOrganization(), user, "project.member_upserted", "project", project.getId(), member.getEmail() + " set as " + request.role() + " on " + project.getName());
        return saved;
    }

    @PatchMapping("/{projectId}/members/{userId}")
    public ProjectMember updateMember(@PathVariable Long projectId, @PathVariable Long userId, @Valid @RequestBody ProjectMemberRequest request) {
        AppUser user = currentUserService.get();
        accessService.requireProjectMemberManagement(user, projectId);
        Project project = findProjectForUser(projectId, user);
        AppUser member = userRepository.findByOrganizationIdAndId(user.getOrganization().getId(), userId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        ProjectMember saved = upsertProjectMember(project, member, request.role());
        auditService.record(user.getOrganization(), user, "project.member_updated", "project", project.getId(), member.getEmail() + " updated to " + request.role() + " on " + project.getName());
        return saved;
    }

    @DeleteMapping("/{projectId}/members/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMember(@PathVariable Long projectId, @PathVariable Long userId) {
        AppUser user = currentUserService.get();
        accessService.requireProjectMemberManagement(user, projectId);
        Project project = findProjectForUser(projectId, user);
        memberRepository.findByProjectIdAndUserId(projectId, userId).ifPresent(member -> {
            memberRepository.delete(member);
            auditService.record(user.getOrganization(), user, "project.member_removed", "project", project.getId(), member.getUser().getEmail() + " removed from " + project.getName());
        });
    }

    private ProjectSummary toSummary(Project project, AppUser user) {
        boolean canSeeAllProjectTasks = accessService.isAdmin(user) || accessService.isTeamLead(user, project.getId());
        long done = canSeeAllProjectTasks
                ? taskRepository.countByProjectIdAndStatus(project.getId(), TaskStatus.DONE)
                : taskRepository.countByProjectIdAndAssigneeIdAndStatus(project.getId(), user.getId(), TaskStatus.DONE);
        long total = canSeeAllProjectTasks
                ? taskRepository.countByProjectId(project.getId())
                : taskRepository.countByProjectIdAndAssigneeId(project.getId(), user.getId());
        var role = memberRepository.findByProjectIdAndUserId(project.getId(), user.getId()).map(ProjectMember::getRole).orElse(null);
        return new ProjectSummary(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getClientName(),
                project.getWorkType(),
                project.getConfidentialityLevel(),
                project.getBillingType(),
                project.getExternalReference(),
                project.getOwner(),
                total,
                total - done,
                done,
                role);
    }

    private List<Project> visibleProjects(AppUser user) {
        if (accessService.isAdmin(user)) {
            return projectRepository.findByOrganizationIdOrderByCreatedAtDesc(user.getOrganization().getId());
        }

        Map<Long, Project> projects = new LinkedHashMap<>();
        memberRepository.findProjectsByUserId(user.getOrganization().getId(), user.getId()).forEach(project -> projects.put(project.getId(), project));
        projectRepository.findAssignedProjects(user.getOrganization().getId(), user.getId()).forEach(project -> projects.put(project.getId(), project));
        return List.copyOf(projects.values());
    }

    private Project findProjectForUser(Long projectId, AppUser user) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new EntityNotFoundException("Project not found"));
        if (!project.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new EntityNotFoundException("Project not found");
        }
        return project;
    }

    private ProjectMember upsertProjectMember(Project project, AppUser user, com.flowos.model.ProjectMemberRole role) {
        ProjectMember member = memberRepository.findByProjectIdAndUserId(project.getId(), user.getId()).orElseGet(ProjectMember::new);
        member.setProject(project);
        member.setUser(user);
        member.setRole(role);
        return memberRepository.save(member);
    }
}
