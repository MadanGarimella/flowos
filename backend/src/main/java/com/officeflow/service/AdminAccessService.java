package com.officeflow.service;

import com.officeflow.model.AppUser;
import com.officeflow.model.UserRole;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class AdminAccessService {
    private static final Set<String> ADMIN_EMAILS = Set.of(
            "madan.garimella@sathyasoftechin.com",
            "vishnu.ippili@sathyasoftechin.com",
            "sathyareddy.md@sathyasoftechin.com"
    );

    public boolean isAdminEmail(String email) {
        return email != null && ADMIN_EMAILS.contains(email.trim().toLowerCase());
    }

    public boolean isAdmin(AppUser user) {
        return user != null && user.getRole() == UserRole.ADMIN && isAdminEmail(user.getEmail());
    }
}

