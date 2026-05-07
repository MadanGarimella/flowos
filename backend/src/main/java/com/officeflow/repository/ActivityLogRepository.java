package com.officeflow.repository;

import com.officeflow.model.ActivityLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByTaskIdOrderByCreatedAtDesc(Long taskId);
}

