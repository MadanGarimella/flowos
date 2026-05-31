package com.flowos.dto;

import com.flowos.model.AppUser;
import com.flowos.model.BillingType;
import com.flowos.model.ConfidentialityLevel;
import com.flowos.model.ProjectMember;
import com.flowos.model.ProjectMemberRole;
import com.flowos.model.ProjectWorkType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class ProjectDtos {
    public record CreateProjectRequest(
            @NotBlank String name,
            String description,
            String clientName,
            ProjectWorkType workType,
            ConfidentialityLevel confidentialityLevel,
            BillingType billingType,
            String externalReference
    ) {}

    public record ProjectSummary(
            Long id,
            String name,
            String description,
            String clientName,
            ProjectWorkType workType,
            ConfidentialityLevel confidentialityLevel,
            BillingType billingType,
            String externalReference,
            AppUser owner,
            long taskCount,
            long openCount,
            long doneCount,
            ProjectMemberRole currentUserProjectRole
    ) {}
    public record ProjectMemberRequest(@NotNull Long userId, @NotNull ProjectMemberRole role) {}
    public record ProjectMembersResponse(List<ProjectMember> members) {}
}
