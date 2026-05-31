package com.flowos.controller;

import com.flowos.repository.OrganizationRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {
    private final OrganizationRepository organizationRepository;

    public OrganizationController(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @GetMapping("/lookup")
    public Object lookup(@RequestParam String name) {
        String slug = normalizeSlug(name);
        return organizationRepository.findBySlug(slug)
                .<Object>map(organization -> java.util.Map.of(
                        "exists", true,
                        "id", organization.getId(),
                        "name", organization.getName(),
                        "slug", organization.getSlug(),
                        "industry", organization.getIndustry()))
                .orElseGet(() -> java.util.Map.of(
                        "exists", false,
                        "name", name.trim(),
                        "slug", slug));
    }

    private String normalizeSlug(String value) {
        String base = value == null ? "" : value.trim().toLowerCase();
        base = base.replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        return base.isBlank() ? "organization" : base;
    }
}
