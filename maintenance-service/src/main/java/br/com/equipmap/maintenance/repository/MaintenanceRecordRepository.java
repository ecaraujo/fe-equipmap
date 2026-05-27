package br.com.equipmap.maintenance.repository;

import br.com.equipmap.maintenance.domain.MaintenanceRecord;
import br.com.equipmap.maintenance.domain.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, UUID>, JpaSpecificationExecutor<MaintenanceRecord> {
    Optional<MaintenanceRecord> findByIdAndCondominiumId(UUID id, UUID condominiumId);

    List<MaintenanceRecord> findByDeletedAtIsNullAndStatusAndScheduledDateBefore(MaintenanceStatus status, LocalDate today);
}
