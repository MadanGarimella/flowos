package com.officeflow.dto;

import com.officeflow.model.AppUser;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {
    public record LoginRequest(@NotBlank String organizationSlug, @Email String email, @NotBlank String password) {}
    public record SignupRequest(
            @NotBlank String organizationName,
            @NotBlank String name,
            @NotBlank String designation,
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8, message = "Password must be at least 8 characters") String password,
            @NotBlank String confirmPassword
    ) {}
    public record InviteSignupRequest(
            @NotBlank String token,
            @NotBlank String name,
            @NotBlank String designation,
            @NotBlank @Size(min = 8, message = "Password must be at least 8 characters") String password,
            @NotBlank String confirmPassword
    ) {}
    public record MemberSignupRequest(
            @NotBlank String organizationSlug,
            @NotBlank String name,
            @NotBlank String designation,
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8, message = "Password must be at least 8 characters") String password,
            @NotBlank String confirmPassword
    ) {}
    public record AuthResponse(String token, AppUser user) {}
}
