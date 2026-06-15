package br.com.equipmap.warranty.repository;

import br.com.equipmap.warranty.domain.Warranty;
import br.com.equipmap.warranty.domain.WarrantyType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WarrantyRepository extends JpaRepository<Warranty, UUID> {
    Optional<Warranty> findByIdAndCondominiumIdAndDeletedAtIsNull(UUID id, UUID condominiumId);

    List<Warranty> findByCondominiumIdAndDeletedAtIsNullOrderByWarrantyEndAsc(UUID condominiumId);

    List<Warranty> findByCondominiumIdAndTypeAndDeletedAtIsNullOrderByWarrantyEndAsc(UUID condominiumId, WarrantyType type);

    List<Warranty> findByDeletedAtIsNullAndWarrantyEndLessThanEqual(LocalDate warrantyEnd);
}
