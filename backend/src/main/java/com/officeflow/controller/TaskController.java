package com.officeflow.controller;

import com.officeflow.dto.TaskDtos.CreateCommentRequest;
import com.officeflow.dto.TaskDtos.CreateTaskRequest;
import com.officeflow.dto.TaskDtos.TaskDetail;
import com.officeflow.dto.TaskDtos.UpdateTaskRequest;
import com.officeflow.model.TaskComment;
import com.officeflow.repository.ActivityLogRepository;
import com.officeflow.repository.TaskCommentRepository;
import com.officeflow.repository.TaskRepository;
import com.officeflow.service.AccessService;
import com.officeflow.service.CurrentUserService;
import com.officeflow.service.TaskService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskRepository taskRepository;
    private final TaskCommentRepository commentRepository;
    private final ActivityLogRepository activityRepository;
    private final CurrentUserService currentUserService;
    private final TaskService taskService;
    private final AccessService accessService;

    public TaskController(
            TaskRepository taskRepository,
            TaskCommentRepository commentRepository,
            ActivityLogRepository activityRepository,
            CurrentUserService currentUserService,
            TaskService taskService,
            AccessService accessService) {
        this.taskRepository = taskRepository;
        this.commentRepository = commentRepository;
        this.activityRepository = activityRepository;
        this.currentUserService = currentUserService;
        this.taskService = taskService;
        this.accessService = accessService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Object create(@Valid @RequestBody CreateTaskRequest request) {
        var user = currentUserService.get();
        accessService.requireTaskManagement(user);
        return taskService.create(request, user);
    }

    @GetMapping("/{taskId}")
    public TaskDetail detail(@PathVariable Long taskId) {
        var user = currentUserService.get();
        var task = taskRepository.findById(taskId).orElseThrow(() -> new EntityNotFoundException("Task not found"));
        accessService.requireTaskView(user, task);
        return new TaskDetail(
                task,
                commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId),
                activityRepository.findByTaskIdOrderByCreatedAtDesc(taskId));
    }

    @PatchMapping("/{taskId}")
    public Object update(@PathVariable Long taskId, @RequestBody UpdateTaskRequest request) {
        return taskService.update(taskId, request, currentUserService.get());
    }

    @PostMapping("/{taskId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskComment comment(@PathVariable Long taskId, @Valid @RequestBody CreateCommentRequest request) {
        var user = currentUserService.get();
        var task = taskRepository.findById(taskId).orElseThrow(() -> new EntityNotFoundException("Task not found"));
        accessService.requireTaskView(user, task);
        TaskComment comment = new TaskComment();
        comment.setTask(task);
        comment.setAuthor(user);
        comment.setBody(request.body());
        TaskComment saved = commentRepository.save(comment);
        taskService.log(task, user, "commented", "Comment added");
        return saved;
    }
}
