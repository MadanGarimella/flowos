package com.officeflow.config;

import com.officeflow.model.UserRole;
import com.officeflow.repository.AppUserRepository;
import com.officeflow.service.AdminAccessService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminRoleGuard implements CommandLineRunner {
    private final AppUserRepository userRepository;
    private final AdminAccessService adminAccessService;

    public AdminRoleGuard(AppUserRepository userRepository, AdminAccessService adminAccessService) {
        this.userRepository = userRepository;
        this.adminAccessService = adminAccessService;
    }

    @Override
    public void run(String... args) {
        var users = userRepository.findAll();
        boolean changed = false;

        for (var user : users) {
            if (adminAccessService.isAdminEmail(user.getEmail()) && user.getRole() != UserRole.ADMIN) {
                user.setRole(UserRole.ADMIN);
                changed = true;
            }
            if (!adminAccessService.isAdminEmail(user.getEmail()) && user.getRole() == UserRole.ADMIN) {
                user.setRole(UserRole.MEMBER);
                changed = true;
            }
        }

        if (changed) {
            userRepository.saveAll(users);
        }
    }
}

