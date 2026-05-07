package com.officeflow.dto;

import com.officeflow.model.ActivityLog;
import com.officeflow.model.Task;
import com.officeflow.model.TaskComment;
import com.officeflow.model.TaskPriority;
import com.officeflow.model.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class TaskDtos {
    public record CreateTaskRequest(
            @NotBlank String title,
            String description,
            @NotNull Long projectId,
            Long assigneeId,
            TaskPriority priority,
            LocalDate dueDate
    ) {}

    public record UpdateTaskRequest(
            String title,
            String description,
            TaskStatus status,
            TaskPriority priority,
            Long assigneeId,
            LocalDate dueDate
    ) {}

    public record CreateCommentRequest(@NotBlank String body) {}

    public record TaskDetail(Task task, List<TaskComment> comments, List<ActivityLog> activity) {}
}

