package com.officeflow.repository;

import com.officeflow.model.AppUser;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByOrganizationSlugAndEmail(String slug, String email);
    Optional<AppUser> findByOrganizationIdAndId(Long organizationId, Long id);
    boolean existsByOrganizationIdAndEmail(Long organizationId, String email);
    List<AppUser> findByOrganizationIdAndActiveTrueOrderByNameAsc(Long organizationId);
}
