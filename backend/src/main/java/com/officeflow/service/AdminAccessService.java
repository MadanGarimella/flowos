package com.officeflow.service;

import com.officeflow.model.AppUser;
import com.officeflow.model.UserRole;
import org.springframework.stereotype.Service;

@Service
public class AdminAccessService {
    public boolean isAdmin(AppUser user) {
        return user != null && user.isActive() && user.getRole() == UserRole.ADMIN;
    }
}
