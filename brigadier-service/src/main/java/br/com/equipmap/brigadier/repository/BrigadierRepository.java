package br.com.equipmap.brigadier.repository;

import br.com.equipmap.brigadier.domain.Brigadier;
import br.com.equipmap.brigadier.domain.BrigadierRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BrigadierRepository extends JpaRepository<Brigadier, UUID> {
    Optional<Brigadier> findByIdAndCondominiumIdAndDeletedAtIsNull(UUID id, UUID condominiumId);

    List<Brigadier> findByCondominiumIdAndDeletedAtIsNullOrderByNameAsc(UUID condominiumId);

    List<Brigadier> findByCondominiumIdAndRoleAndDeletedAtIsNullOrderByNameAsc(UUID condominiumId, BrigadierRole role);
}
