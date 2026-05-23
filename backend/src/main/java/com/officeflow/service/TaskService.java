package com.officeflow.service;

import com.officeflow.dto.TaskDtos.CreateTaskRequest;
import com.officeflow.dto.TaskDtos.UpdateTaskRequest;
import com.officeflow.model.ActivityLog;
import com.officeflow.model.AppUser;
import com.officeflow.model.Project;
import com.officeflow.model.ProjectMember;
import com.officeflow.model.ProjectMemberRole;
import com.officeflow.model.Task;
import com.officeflow.model.TaskPriority;
import com.officeflow.repository.ActivityLogRepository;
import com.officeflow.repository.AppUserRepository;
import com.officeflow.repository.ProjectMemberRepository;
import com.officeflow.repository.ProjectRepository;
import com.officeflow.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import java.time.Instant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final AppUserRepository userRepository;
    private final ActivityLogRepository activityRepository;
    private final AccessService accessService;
    private final ProjectMemberRepository memberRepository;

    public TaskService(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            AppUserRepository userRepository,
            ActivityLogRepository activityRepository,
            AccessService accessService,
            ProjectMemberRepository memberRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.activityRepository = activityRepository;
        this.accessService = accessService;
        this.memberRepository = memberRepository;
    }

    @Transactional
    public Task create(CreateTaskRequest request, AppUser reporter) {
        Task task = new Task();
        task.setTitle(request.title());
        task.setDescription(request.description());
        Project project = projectRepository.findById(request.projectId()).orElseThrow(() -> new EntityNotFoundException("Project not found"));
        if (!project.getOrganization().getId().equals(reporter.getOrganization().getId())) {
            throw new EntityNotFoundException("Project not found");
        }
        task.setProject(project);
        task.setReporter(reporter);
        task.setAssignee(findUser(request.assigneeId(), reporter));
        task.setPriority(request.priority() == null ? TaskPriority.MEDIUM : request.priority());
        task.setDueDate(request.dueDate());
        Task saved = taskRepository.save(task);
        ensureProjectMember(project, saved.getAssignee(), ProjectMemberRole.MEMBER);
        log(saved, reporter, "created", "Task was created");
        return saved;
    }

    @Transactional
    public Task update(Long taskId, UpdateTaskRequest request, AppUser actor) {
        Task task = taskRepository.findById(taskId).orElseThrow(() -> new EntityNotFoundException("Task not found"));
        accessService.requireTaskView(actor, task);
        StringBuilder changes = new StringBuilder();

        boolean manager = accessService.canManageTasks(actor);

        if (request.title() != null && manager) {
            task.setTitle(request.title());
        }
        if (request.description() != null && manager) {
            task.setDescription(request.description());
        }
        if (request.status() != null && request.status() != task.getStatus()) {
            changes.append("Status: ").append(task.getStatus()).append(" -> ").append(request.status()).append(". ");
            task.setStatus(request.status());
        }
        if (request.priority() != null && manager) {
            task.setPriority(request.priority());
        }
        if (request.assigneeId() != null && manager) {
            task.setAssignee(findUser(request.assigneeId(), actor));
            ensureProjectMember(task.getProject(), task.getAssignee(), ProjectMemberRole.MEMBER);
        }
        if (request.dueDate() != null && manager) {
            task.setDueDate(request.dueDate());
        }

        task.setUpdatedAt(Instant.now());
        Task saved = taskRepository.save(task);
        log(saved, actor, "updated", changes.isEmpty() ? "Task details were updated" : changes.toString());
        return saved;
    }

    public void log(Task task, AppUser actor, String action, String detail) {
        ActivityLog activity = new ActivityLog();
        activity.setTask(task);
        activity.setActor(actor);
        activity.setAction(action);
        activity.setDetail(detail);
        activityRepository.save(activity);
    }

    private AppUser findUser(Long userId, AppUser actor) {
        if (userId == null) {
            return null;
        }
        return userRepository.findByOrganizationIdAndId(actor.getOrganization().getId(), userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    private void ensureProjectMember(Project project, AppUser user, ProjectMemberRole role) {
        if (user == null) {
            return;
        }

        ProjectMember member = memberRepository.findByProjectIdAndUserId(project.getId(), user.getId()).orElseGet(ProjectMember::new);
        member.setProject(project);
        member.setUser(user);
        if (member.getRole() == null) {
            member.setRole(role);
        }
        memberRepository.save(member);
    }
}
