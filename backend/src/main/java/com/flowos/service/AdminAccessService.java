package com.flowos.service;

import com.flowos.model.AppUser;
import com.flowos.model.UserRole;
import org.springframework.stereotype.Service;

@Service
public class AdminAccessService {
    public boolean isAdmin(AppUser user) {
        return user != null && user.isActive() && user.getRole() == UserRole.ADMIN;
    }
}
