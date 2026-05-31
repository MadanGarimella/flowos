package com.flowos.repository;

import com.flowos.model.Invitation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {
    Optional<Invitation> findByToken(String token);
    List<Invitation> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);
}
