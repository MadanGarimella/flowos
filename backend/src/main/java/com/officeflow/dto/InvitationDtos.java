package com.officeflow.dto;

import com.officeflow.model.Invitation;
import com.officeflow.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class InvitationDtos {
    public record CreateInvitationRequest(@Email @NotBlank String email, @NotNull UserRole role, String appUrl) {}
    public record InvitationResponse(Invitation invitation, String invitationLink) {}
}
