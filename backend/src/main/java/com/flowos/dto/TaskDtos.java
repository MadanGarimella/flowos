package com.flowos.dto;

import com.flowos.model.ActivityLog;
import com.flowos.model.ApprovalStage;
import com.flowos.model.Task;
import com.flowos.model.TaskDeliverableType;
import com.flowos.model.TaskComment;
import com.flowos.model.TaskPriority;
import com.flowos.model.TaskStatus;
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
            LocalDate dueDate,
            TaskDeliverableType deliverableType,
            ApprovalStage approvalStage,
            LocalDate complianceDate,
            Integer estimatedHours
    ) {}

    public record UpdateTaskRequest(
            String title,
            String description,
            TaskStatus status,
            TaskPriority priority,
            Long assigneeId,
            LocalDate dueDate,
            TaskDeliverableType deliverableType,
            ApprovalStage approvalStage,
            LocalDate complianceDate,
            Integer estimatedHours
    ) {}

    public record CreateCommentRequest(@NotBlank String body) {}

    public record TaskDetail(Task task, List<TaskComment> comments, List<ActivityLog> activity) {}
}
