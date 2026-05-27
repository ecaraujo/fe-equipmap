package br.com.equipmap.equipment.repository;

import br.com.equipmap.equipment.domain.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EquipmentRepository extends JpaRepository<Equipment, UUID>, JpaSpecificationExecutor<Equipment> {
    Optional<Equipment> findByIdAndCondominiumId(UUID id, UUID condominiumId);

    @Query("select coalesce(max(e.patrimonyCode), '') from Equipment e where e.condominiumId = :condominiumId")
    String maxPatrimonyCode(UUID condominiumId);

    List<Equipment> findByDeletedAtIsNullAndNextMaintenanceBefore(LocalDate today);
}
