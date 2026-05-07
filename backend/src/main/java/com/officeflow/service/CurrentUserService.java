package com.officeflow.service;

import com.officeflow.model.AppUser;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {
    public AppUser get() {
        return (AppUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}

