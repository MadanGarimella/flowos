package com.officeflow.controller;

import com.officeflow.dto.ProjectDtos.CreateProjectRequest;
import com.officeflow.dto.ProjectDtos.ProjectMemberRequest;
import com.officeflow.dto.ProjectDtos.ProjectMembersResponse;
import com.officeflow.dto.ProjectDtos.ProjectSummary;
import com.officeflow.model.AppUser;
import com.officeflow.model.ProjectMember;
import com.officeflow.model.Project;
import com.officeflow.model.TaskStatus;
import com.officeflow.repository.AppUserRepository;
import com.officeflow.repository.ProjectMemberRepository;
import com.officeflow.repository.ProjectRepository;
import com.officeflow.repository.TaskRepository;
import com.officeflow.service.AccessService;
import com.officeflow.service.CurrentUserService;
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

    public ProjectController(
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            ProjectMemberRepository memberRepository,
            AppUserRepository userRepository,
            CurrentUserService currentUserService,
            AccessService accessService) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
        this.accessService = accessService;
    }

    @GetMapping
    public List<ProjectSummary> list() {
        AppUser user = currentUserService.get();
        List<Project> projects = visibleProjects(user);
        return projects.stream().map(project -> toSummary(project, user)).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public Project create(@Valid @RequestBody CreateProjectRequest request) {
        Project project = new Project();
        project.setName(request.name());
        project.setDescription(request.description());
        project.setOwner(currentUserService.get());
        Project saved = projectRepository.save(project);
        upsertProjectMember(saved, currentUserService.get(), com.officeflow.model.ProjectMemberRole.TEAM_LEAD);
        return saved;
    }

    @GetMapping("/{projectId}/tasks")
    public Object tasks(@PathVariable Long projectId) {
        AppUser user = currentUserService.get();
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new EntityNotFoundException("Project not found"));
        accessService.requireProjectView(user, project);
        return accessService.isAdmin(user) || accessService.isTeamLead(user, projectId)
                ? taskRepository.findByProjectIdOrderByUpdatedAtDesc(projectId)
                : taskRepository.findByProjectIdAndAssigneeIdOrderByUpdatedAtDesc(projectId, user.getId());
    }

    @GetMapping("/{projectId}/members")
    public ProjectMembersResponse members(@PathVariable Long projectId) {
        AppUser user = currentUserService.get();
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new EntityNotFoundException("Project not found"));
        accessService.requireProjectView(user, project);
        return new ProjectMembersResponse(memberRepository.findByProjectIdOrderByUserNameAsc(projectId));
    }

    @PostMapping("/{projectId}/members")
    public ProjectMember addMember(@PathVariable Long projectId, @Valid @RequestBody ProjectMemberRequest request) {
        AppUser user = currentUserService.get();
        accessService.requireProjectMemberManagement(user, projectId);
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new EntityNotFoundException("Project not found"));
        AppUser member = userRepository.findById(request.userId()).orElseThrow(() -> new EntityNotFoundException("User not found"));
        return upsertProjectMember(project, member, request.role());
    }

    @PatchMapping("/{projectId}/members/{userId}")
    public ProjectMember updateMember(@PathVariable Long projectId, @PathVariable Long userId, @Valid @RequestBody ProjectMemberRequest request) {
        AppUser user = currentUserService.get();
        accessService.requireProjectMemberManagement(user, projectId);
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new EntityNotFoundException("Project not found"));
        AppUser member = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        return upsertProjectMember(project, member, request.role());
    }

    @DeleteMapping("/{projectId}/members/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMember(@PathVariable Long projectId, @PathVariable Long userId) {
        AppUser user = currentUserService.get();
        accessService.requireProjectMemberManagement(user, projectId);
        memberRepository.findByProjectIdAndUserId(projectId, userId).ifPresent(memberRepository::delete);
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
                project.getOwner(),
                total,
                total - done,
                done,
                role);
    }

    private List<Project> visibleProjects(AppUser user) {
        if (accessService.isAdmin(user)) {
            return projectRepository.findAll();
        }

        Map<Long, Project> projects = new LinkedHashMap<>();
        memberRepository.findProjectsByUserId(user.getId()).forEach(project -> projects.put(project.getId(), project));
        projectRepository.findAssignedProjects(user.getId()).forEach(project -> projects.put(project.getId(), project));
        return List.copyOf(projects.values());
    }

    private ProjectMember upsertProjectMember(Project project, AppUser user, com.officeflow.model.ProjectMemberRole role) {
        ProjectMember member = memberRepository.findByProjectIdAndUserId(project.getId(), user.getId()).orElseGet(ProjectMember::new);
        member.setProject(project);
        member.setUser(user);
        member.setRole(role);
        return memberRepository.save(member);
    }
}
