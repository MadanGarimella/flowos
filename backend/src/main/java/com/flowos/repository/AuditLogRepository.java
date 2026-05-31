package com.flowos.repository;

import com.flowos.model.AuditLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop100ByOrganizationIdOrderByCreatedAtDesc(Long organizationId);
}
