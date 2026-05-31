package com.flowos.dto;

import com.flowos.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UserDtos {
    public record CreateUserRequest(
            @NotBlank String name,
            @NotBlank String designation,
            @Email @NotBlank String email,
            @NotNull UserRole role,
            @NotBlank @Size(min = 8, message = "Password must be at least 8 characters") String password
    ) {}
    public record OffboardUserRequest(Long reassignToUserId) {}
}
