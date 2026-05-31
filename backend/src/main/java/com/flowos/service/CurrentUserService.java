package com.flowos.service;

import com.flowos.model.AppUser;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {
    public AppUser get() {
        return (AppUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}

