package com.officeflow.dto;

import com.officeflow.model.AppUser;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {
    public record LoginRequest(@Email String email, @NotBlank String password) {}
    public record SignupRequest(
            @NotBlank String name,
            @NotBlank String designation,
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8, message = "Password must be at least 8 characters") String password,
            @NotBlank String confirmPassword
    ) {}
    public record AuthResponse(String token, AppUser user) {}
}
