package com.flowos.dto;

import com.flowos.model.Invitation;
import com.flowos.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class InvitationDtos {
    public record CreateInvitationRequest(@Email @NotBlank String email, @NotNull UserRole role, String appUrl) {}
    public record InvitationResponse(Invitation invitation, String invitationLink) {}
}
