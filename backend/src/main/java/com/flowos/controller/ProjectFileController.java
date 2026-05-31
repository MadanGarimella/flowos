package com.flowos.controller;

import com.flowos.model.AppUser;
import com.flowos.model.Project;
import com.flowos.model.ProjectFile;
import com.flowos.repository.ProjectRepository;
import com.flowos.service.AccessService;
import com.flowos.service.CurrentUserService;
import com.flowos.service.ProjectFileService;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class ProjectFileController {
    private final ProjectRepository projectRepository;
    private final ProjectFileService fileService;
    private final CurrentUserService currentUserService;
    private final AccessService accessService;

    public ProjectFileController(
            ProjectRepository projectRepository,
            ProjectFileService fileService,
            CurrentUserService currentUserService,
            AccessService accessService) {
        this.projectRepository = projectRepository;
        this.fileService = fileService;
        this.currentUserService = currentUserService;
        this.accessService = accessService;
    }

    @GetMapping("/projects/{projectId}/files")
    public List<ProjectFile> list(@PathVariable Long projectId) {
        AppUser user = currentUserService.get();
        Project project = requireProject(projectId, user);
        accessService.requireProjectView(user, project);
        return fileService.list(projectId);
    }

    @PostMapping(value = "/projects/{projectId}/files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectFile upload(@PathVariable Long projectId, @RequestParam("file") MultipartFile file) {
        AppUser user = currentUserService.get();
        Project project = requireProject(projectId, user);
        accessService.requireProjectView(user, project);
        return fileService.store(project, user, file);
    }

    @GetMapping("/files/{fileId}/download")
    public ResponseEntity<Resource> download(@PathVariable Long fileId) {
        AppUser user = currentUserService.get();
        ProjectFile file = fileService.get(fileId);
        accessService.requireProjectView(user, file.getProject());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(file.getOriginalName()).build().toString())
                .body(fileService.load(file));
    }

    @DeleteMapping("/files/{fileId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long fileId) {
        AppUser user = currentUserService.get();
        ProjectFile file = fileService.get(fileId);
        accessService.requireProjectView(user, file.getProject());
        boolean canDelete = accessService.isAdmin(user)
                || accessService.isTeamLead(user, file.getProject().getId())
                || file.getUploadedBy().getId().equals(user.getId());
        if (!canDelete) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the uploader, an admin, or a project team lead can delete this file");
        }
        fileService.delete(file, user);
    }

    private Project requireProject(Long projectId, AppUser user) {
        return projectRepository.findById(projectId)
                .filter(project -> project.getOrganization().getId().equals(user.getOrganization().getId()))
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
    }
}
