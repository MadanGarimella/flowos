package com.officeflow.repository;

import com.officeflow.model.Project;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    @Query("select distinct p from Project p join Task t on t.project = p where t.assignee.id = :userId")
    List<Project> findAssignedProjects(@Param("userId") Long userId);
}
