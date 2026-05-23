package com.officeflow.controller;

import com.officeflow.dto.InvitationDtos.CreateInvitationRequest;
import com.officeflow.dto.InvitationDtos.InvitationResponse;
import com.officeflow.model.Invitation;
import com.officeflow.repository.AppUserRepository;
import com.officeflow.repository.InvitationRepository;
import com.officeflow.service.AdminAccessService;
import com.officeflow.service.CurrentUserService;
import jakarta.validation.Valid;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/invitations")
public class InvitationController {
    private final InvitationRepository invitationRepository;
    private final AppUserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final AdminAccessService adminAccessService;
    private final SecureRandom secureRandom = new SecureRandom();

    public InvitationController(
            InvitationRepository invitationRepository,
            AppUserRepository userRepository,
            CurrentUserService currentUserService,
            AdminAccessService adminAccessService) {
        this.invitationRepository = invitationRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
        this.adminAccessService = adminAccessService;
    }

    @GetMapping
    public List<Invitation> list() {
        var user = currentUserService.get();
        requireAdmin(user);
        return invitationRepository.findByOrganizationIdOrderByCreatedAtDesc(user.getOrganization().getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InvitationResponse create(@Valid @RequestBody CreateInvitationRequest request) {
        var user = currentUserService.get();
        requireAdmin(user);
        String email = normalizeEmail(request.email());
        if (userRepository.existsByOrganizationIdAndEmail(user.getOrganization().getId(), email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This user is already in your organization");
        }

        Invitation invitation = new Invitation();
        invitation.setOrganization(user.getOrganization());
        invitation.setEmail(email);
        invitation.setRole(request.role());
        invitation.setInvitedBy(user);
        invitation.setToken(newToken());
        invitation.setExpiresAt(Instant.now().plus(14, ChronoUnit.DAYS));
        Invitation saved = invitationRepository.save(invitation);
        return new InvitationResponse(saved, invitationLink(request.appUrl(), saved.getToken()));
    }

    private void requireAdmin(com.officeflow.model.AppUser user) {
        if (!adminAccessService.isAdmin(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only organization admins can manage invitations");
        }
    }

    private String newToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String invitationLink(String appUrl, String token) {
        String base = appUrl == null || appUrl.isBlank() ? "" : appUrl.trim().replaceAll("/$", "");
        return base + "/invite/" + token;
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
