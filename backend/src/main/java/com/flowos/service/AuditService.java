package com.flowos.service;

import com.flowos.model.AppUser;
import com.flowos.model.AuditLog;
import com.flowos.model.Organization;
import com.flowos.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditService {
    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void record(Organization organization, AppUser actor, String action, String targetType, Long targetId, String detail) {
        if (organization == null) {
            return;
        }
        AuditLog log = new AuditLog();
        log.setOrganization(organization);
        log.setActor(actor);
        log.setAction(action);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setDetail(detail);
        auditLogRepository.save(log);
    }
}
