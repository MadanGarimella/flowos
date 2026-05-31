package com.flowos.repository;

import com.flowos.model.Project;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);

    @Query("select distinct p from Project p join Task t on t.project = p where p.organization.id = :organizationId and t.assignee.id = :userId")
    List<Project> findAssignedProjects(@Param("organizationId") Long organizationId, @Param("userId") Long userId);
}
