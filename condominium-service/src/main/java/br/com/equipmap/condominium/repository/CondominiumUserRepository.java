package br.com.equipmap.condominium.repository;

import br.com.equipmap.condominium.domain.CondominiumUser;
import br.com.equipmap.condominium.domain.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CondominiumUserRepository extends JpaRepository<CondominiumUser, UUID> {
    List<CondominiumUser> findAllByCondominium_IdAndActiveTrue(UUID condominiumId);

    List<CondominiumUser> findAllByUserIdAndActiveTrue(UUID userId);

    Optional<CondominiumUser> findByCondominium_IdAndUserId(UUID condominiumId, UUID userId);

    long countByCondominium_IdAndRoleAndActiveTrue(UUID condominiumId, UserRole role);
}
