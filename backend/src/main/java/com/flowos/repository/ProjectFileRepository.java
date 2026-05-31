package com.flowos.repository;

import com.flowos.model.ProjectFile;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectFileRepository extends JpaRepository<ProjectFile, Long> {
    List<ProjectFile> findByProjectIdOrderByCreatedAtDesc(Long projectId);
}
