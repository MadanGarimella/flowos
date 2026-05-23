package com.officeflow.repository;

import com.officeflow.model.Task;
import com.officeflow.model.TaskStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectIdOrderByUpdatedAtDesc(Long projectId);
    List<Task> findByProjectIdAndAssigneeIdOrderByUpdatedAtDesc(Long projectId, Long assigneeId);
    List<Task> findByProjectOrganizationIdAndAssigneeId(Long organizationId, Long assigneeId);
    boolean existsByProjectIdAndAssigneeId(Long projectId, Long assigneeId);
    long countByProjectId(Long projectId);
    long countByProjectIdAndStatus(Long projectId, TaskStatus status);
    long countByProjectIdAndAssigneeId(Long projectId, Long assigneeId);
    long countByProjectIdAndAssigneeIdAndStatus(Long projectId, Long assigneeId, TaskStatus status);
}
