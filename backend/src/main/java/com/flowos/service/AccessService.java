package com.flowos.service;

import com.flowos.model.AppUser;
import com.flowos.model.Project;
import com.flowos.model.ProjectMemberRole;
import com.flowos.model.Task;
import com.flowos.repository.ProjectMemberRepository;
import com.flowos.repository.TaskRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AccessService {
    private final ProjectMemberRepository memberRepository;
    private final TaskRepository taskRepository;
    private final AdminAccessService adminAccessService;

    public AccessService(ProjectMemberRepository memberRepository, TaskRepository taskRepository, AdminAccessService adminAccessService) {
        this.memberRepository = memberRepository;
        this.taskRepository = taskRepository;
        this.adminAccessService = adminAccessService;
    }

    public boolean isAdmin(AppUser user) {
        return adminAccessService.isAdmin(user);
    }

    public boolean isTeamLead(AppUser user, Long projectId) {
        return user != null && memberRepository.existsByProjectIdAndUserIdAndRole(projectId, user.getId(), ProjectMemberRole.TEAM_LEAD);
    }

    public boolean isProjectMember(AppUser user, Long projectId) {
        return memberRepository.existsByProjectIdAndUserId(projectId, user.getId());
    }

    public boolean canViewProject(AppUser user, Project project) {
        return sameOrganization(user, project)
                && (isAdmin(user)
                || isProjectMember(user, project.getId())
                || taskRepository.existsByProjectIdAndAssigneeId(project.getId(), user.getId()));
    }

    public boolean canViewTask(AppUser user, Task task) {
        return sameOrganization(user, task.getProject())
                && (isAdmin(user)
                || isTeamLead(user, task.getProject().getId())
                || (task.getAssignee() != null && task.getAssignee().getId().equals(user.getId())));
    }

    public boolean canManageTasks(AppUser user) {
        return user != null
                && user.isActive()
                && (user.getRole() == com.flowos.model.UserRole.ADMIN || user.getRole() == com.flowos.model.UserRole.MANAGER);
    }

    public boolean canManageProjectMembers(AppUser user, Long projectId) {
        return isAdmin(user) || isTeamLead(user, projectId);
    }

    public boolean sameOrganization(AppUser user, Project project) {
        return user != null
                && project != null
                && user.getOrganization() != null
                && project.getOrganization() != null
                && user.getOrganization().getId().equals(project.getOrganization().getId());
    }

    public void requireProjectView(AppUser user, Project project) {
        if (!canViewProject(user, project)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this project");
        }
    }

    public void requireTaskView(AppUser user, Task task) {
        if (!canViewTask(user, task)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this task");
        }
    }

    public void requireTaskManagement(AppUser user) {
        if (!canManageTasks(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can create or assign tasks");
        }
    }

    public void requireProjectMemberManagement(AppUser user, Long projectId) {
        if (!canManageProjectMembers(user, projectId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins and project team leads can manage project members");
        }
    }
}
