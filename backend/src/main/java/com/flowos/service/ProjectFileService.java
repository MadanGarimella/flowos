package com.flowos.service;

import com.flowos.model.AppUser;
import com.flowos.model.Project;
import com.flowos.model.ProjectFile;
import com.flowos.repository.ProjectFileRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProjectFileService {
    private final ProjectFileRepository fileRepository;
    private final AuditService auditService;
    private final Path uploadDirectory;

    public ProjectFileService(
            ProjectFileRepository fileRepository,
            AuditService auditService,
            @Value("${app.upload-dir}") String uploadDirectory) {
        this.fileRepository = fileRepository;
        this.auditService = auditService;
        this.uploadDirectory = Path.of(uploadDirectory).toAbsolutePath().normalize();
    }

    public List<ProjectFile> list(Long projectId) {
        return fileRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
    }

    public ProjectFile store(Project project, AppUser uploader, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a file to upload");
        }

        String originalName = safeOriginalName(file.getOriginalFilename());
        String storageName = project.getId() + "-" + UUID.randomUUID();
        Path destination = resolveStoragePath(storageName);
        try {
            Files.createDirectories(uploadDirectory);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store the uploaded file");
        }

        ProjectFile projectFile = new ProjectFile();
        projectFile.setProject(project);
        projectFile.setUploadedBy(uploader);
        projectFile.setOriginalName(originalName);
        projectFile.setStorageName(storageName);
        projectFile.setContentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType());
        projectFile.setSizeBytes(file.getSize());
        ProjectFile saved = fileRepository.save(projectFile);
        auditService.record(project.getOrganization(), uploader, "project.file_uploaded", "project_file", saved.getId(), "Uploaded " + originalName + " to " + project.getName());
        return saved;
    }

    public ProjectFile get(Long fileId) {
        return fileRepository.findById(fileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));
    }

    public Resource load(ProjectFile file) {
        try {
            Resource resource = new UrlResource(resolveStoragePath(file.getStorageName()).toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File content not found");
            }
            return resource;
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File content not found");
        }
    }

    public void delete(ProjectFile file, AppUser actor) {
        try {
            Files.deleteIfExists(resolveStoragePath(file.getStorageName()));
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not delete the file");
        }
        fileRepository.delete(file);
        auditService.record(file.getProject().getOrganization(), actor, "project.file_deleted", "project_file", file.getId(), "Deleted " + file.getOriginalName() + " from " + file.getProject().getName());
    }

    private String safeOriginalName(String originalName) {
        String name = originalName == null ? "shared-file" : Path.of(originalName).getFileName().toString().trim();
        return name.isBlank() ? "shared-file" : name;
    }

    private Path resolveStoragePath(String storageName) {
        Path path = uploadDirectory.resolve(storageName).normalize();
        if (!path.startsWith(uploadDirectory)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file path");
        }
        return path;
    }
}
