package com.flowos.controller;

import com.flowos.dto.AuthDtos.AuthResponse;
import com.flowos.dto.AuthDtos.InviteSignupRequest;
import com.flowos.dto.AuthDtos.LoginRequest;
import com.flowos.dto.AuthDtos.MemberSignupRequest;
import com.flowos.dto.AuthDtos.SignupRequest;
import com.flowos.model.Invitation;
import com.flowos.model.AppUser;
import com.flowos.model.Organization;
import com.flowos.model.OrganizationIndustry;
import com.flowos.model.UserRole;
import com.flowos.repository.AppUserRepository;
import com.flowos.repository.InvitationRepository;
import com.flowos.repository.OrganizationRepository;
import com.flowos.security.TokenService;
import com.flowos.service.AuditService;
import com.flowos.service.CurrentUserService;
import jakarta.validation.Valid;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
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
    private final OrganizationRepository organizationRepository;
    private final InvitationRepository invitationRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final CurrentUserService currentUserService;
    private final AuditService auditService;
    private final boolean openMemberSignup;

    public AuthController(
            AppUserRepository userRepository,
            OrganizationRepository organizationRepository,
            InvitationRepository invitationRepository,
            PasswordEncoder passwordEncoder,
            TokenService tokenService,
            CurrentUserService currentUserService,
            AuditService auditService,
            @Value("${app.open-member-signup:false}") boolean openMemberSignup) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.invitationRepository = invitationRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.currentUserService = currentUserService;
        this.auditService = auditService;
        this.openMemberSignup = openMemberSignup;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        var user = userRepository.findByOrganizationSlugAndEmail(normalizeSlug(request.organizationSlug()), normalizeEmail(request.email()))
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
        String organizationSlug = uniqueSlug(request.organizationName());
        String email = normalizeEmail(request.email());

        Organization organization = new Organization();
        organization.setName(request.organizationName().trim());
        organization.setSlug(organizationSlug);
        organization.setIndustry(request.industry() == null ? OrganizationIndustry.GENERAL_BUSINESS : request.industry());
        Organization savedOrganization = organizationRepository.save(organization);

        AppUser user = new AppUser();
        user.setOrganization(savedOrganization);
        user.setName(request.name());
        user.setDesignation(request.designation());
        user.setEmail(email);
        user.setRole(UserRole.ADMIN);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        AppUser savedUser = userRepository.save(user);
        auditService.record(savedOrganization, savedUser, "organization.created", "organization", savedOrganization.getId(), "Organization registered");
        return java.util.Map.of(
                "message", "Organization created. Please sign in.",
                "organizationSlug", savedOrganization.getSlug());
    }

    @PostMapping("/member-signup")
    @ResponseStatus(HttpStatus.CREATED)
    public Object memberSignup(@Valid @RequestBody MemberSignupRequest request) {
        if (!openMemberSignup) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Member signup is invitation-only for this workspace");
        }
        if (!request.password().equals(request.confirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
        }

        Organization organization = organizationRepository.findBySlug(normalizeSlug(request.organizationSlug()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
        String email = normalizeEmail(request.email());
        if (userRepository.existsByOrganizationIdAndEmail(organization.getId(), email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists in this organization");
        }

        AppUser user = new AppUser();
        user.setOrganization(organization);
        user.setName(request.name());
        user.setDesignation(request.designation());
        user.setEmail(email);
        user.setRole(UserRole.MEMBER);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        AppUser saved = userRepository.save(user);
        auditService.record(organization, saved, "user.self_registered", "user", saved.getId(), "Member self-signup completed");
        return java.util.Map.of("message", "Account created. Please sign in.", "organizationSlug", organization.getSlug());
    }

    @PostMapping("/invites/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse signupWithInvite(@Valid @RequestBody InviteSignupRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
        }
        Invitation invite = invitationRepository.findByToken(request.token())
                .filter(candidate -> candidate.getAcceptedAt() == null)
                .filter(candidate -> candidate.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invitation is invalid or expired"));
        if (userRepository.existsByOrganizationIdAndEmail(invite.getOrganization().getId(), invite.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists in this organization");
        }

        AppUser user = new AppUser();
        user.setOrganization(invite.getOrganization());
        user.setName(request.name());
        user.setDesignation(request.designation());
        user.setEmail(invite.getEmail());
        user.setRole(invite.getRole());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        AppUser saved = userRepository.save(user);

        invite.setAcceptedAt(Instant.now());
        invitationRepository.save(invite);
        auditService.record(saved.getOrganization(), saved, "invitation.accepted", "invitation", invite.getId(), "Invitation accepted by " + saved.getEmail());
        return new AuthResponse(tokenService.createToken(saved), saved);
    }

    @GetMapping("/invites/{token}")
    public Object invite(@org.springframework.web.bind.annotation.PathVariable String token) {
        Invitation invite = invitationRepository.findByToken(token)
                .filter(candidate -> candidate.getAcceptedAt() == null)
                .filter(candidate -> candidate.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));
        return java.util.Map.of(
                "email", invite.getEmail(),
                "organizationName", invite.getOrganization().getName(),
                "organizationSlug", invite.getOrganization().getSlug(),
                "role", invite.getRole());
    }

    @GetMapping("/me")
    @ResponseStatus(HttpStatus.OK)
    public Object me() {
        return currentUserService.get();
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String normalizeSlug(String value) {
        return value == null ? null : value.trim().toLowerCase();
    }

    private String uniqueSlug(String name) {
        String base = normalizeSlug(name).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        if (base.isBlank()) {
            base = "organization";
        }
        String candidate = base;
        int suffix = 2;
        while (organizationRepository.existsBySlug(candidate)) {
            candidate = base + "-" + suffix;
            suffix++;
        }
        return candidate;
    }
}
