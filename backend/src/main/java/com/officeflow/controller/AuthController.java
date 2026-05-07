package com.officeflow.controller;

import com.officeflow.dto.AuthDtos.AuthResponse;
import com.officeflow.dto.AuthDtos.LoginRequest;
import com.officeflow.dto.AuthDtos.SignupRequest;
import com.officeflow.model.AppUser;
import com.officeflow.model.UserRole;
import com.officeflow.repository.AppUserRepository;
import com.officeflow.security.TokenService;
import com.officeflow.service.AdminAccessService;
import com.officeflow.service.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final CurrentUserService currentUserService;
    private final AdminAccessService adminAccessService;

    public AuthController(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            TokenService tokenService,
            CurrentUserService currentUserService,
            AdminAccessService adminAccessService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.currentUserService = currentUserService;
        this.adminAccessService = adminAccessService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        var user = userRepository.findByEmail(normalizeEmail(request.email()))
                .filter(candidate -> passwordEncoder.matches(request.password(), candidate.getPasswordHash()))
                .filter(candidate -> candidate.isActive())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        return new AuthResponse(tokenService.createToken(user), user);
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public Object signup(@Valid @RequestBody SignupRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
        }
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        AppUser user = new AppUser();
        user.setName(request.name());
        user.setDesignation(request.designation());
        user.setEmail(email);
        user.setRole(adminAccessService.isAdminEmail(email) ? UserRole.ADMIN : UserRole.MEMBER);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        userRepository.save(user);
        return java.util.Map.of("message", "Account created. Please sign in.");
    }

    @GetMapping("/me")
    @ResponseStatus(HttpStatus.OK)
    public Object me() {
        return currentUserService.get();
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
