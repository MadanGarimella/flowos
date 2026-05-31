package com.flowos.repository;

import com.flowos.model.Project;
import com.flowos.model.ProjectMember;
import com.flowos.model.ProjectMemberRole;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    List<ProjectMember> findByProjectIdOrderByUserNameAsc(Long projectId);
    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);
    List<ProjectMember> findByProjectOrganizationIdAndUserId(Long organizationId, Long userId);
    boolean existsByProjectIdAndUserId(Long projectId, Long userId);
    boolean existsByProjectIdAndUserIdAndRole(Long projectId, Long userId, ProjectMemberRole role);

    @Query("select pm.project from ProjectMember pm where pm.project.organization.id = :organizationId and pm.user.id = :userId")
    List<Project> findProjectsByUserId(@Param("organizationId") Long organizationId, @Param("userId") Long userId);
}
