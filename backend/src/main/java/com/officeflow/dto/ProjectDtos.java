package com.officeflow.dto;

import com.officeflow.model.AppUser;
import com.officeflow.model.ProjectMember;
import com.officeflow.model.ProjectMemberRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class ProjectDtos {
    public record CreateProjectRequest(@NotBlank String name, String description) {}
    public record ProjectSummary(Long id, String name, String description, AppUser owner, long taskCount, long openCount, long doneCount, ProjectMemberRole currentUserProjectRole) {}
    public record ProjectMemberRequest(@NotNull Long userId, @NotNull ProjectMemberRole role) {}
    public record ProjectMembersResponse(List<ProjectMember> members) {}
}
