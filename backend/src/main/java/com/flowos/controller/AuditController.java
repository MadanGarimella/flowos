package com.flowos.controller;

import com.flowos.model.AuditLog;
import com.flowos.repository.AuditLogRepository;
import com.flowos.service.AdminAccessService;
import com.flowos.service.CurrentUserService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/audit")
public class AuditController {
    private final AuditLogRepository auditLogRepository;
    private final CurrentUserService currentUserService;
    private final AdminAccessService adminAccessService;

    public AuditController(
            AuditLogRepository auditLogRepository,
            CurrentUserService currentUserService,
            AdminAccessService adminAccessService) {
        this.auditLogRepository = auditLogRepository;
        this.currentUserService = currentUserService;
        this.adminAccessService = adminAccessService;
    }

    @GetMapping
    public List<AuditLog> list() {
        var user = currentUserService.get();
        if (!adminAccessService.isAdmin(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can view audit logs");
        }
        return auditLogRepository.findTop100ByOrganizationIdOrderByCreatedAtDesc(user.getOrganization().getId());
    }
}
