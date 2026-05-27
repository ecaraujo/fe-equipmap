package br.com.equipmap.maintenance.api.dto;

import br.com.equipmap.maintenance.domain.MaintenanceRecord;
import br.com.equipmap.maintenance.domain.MaintenanceStatus;
import br.com.equipmap.maintenance.domain.MaintenanceType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record MaintenanceResponse(
        UUID id,
        UUID condominiumId,
        String equipment,
        UUID equipmentId,
        MaintenanceType type,
        String typeLabel,
        MaintenanceStatus status,
        String statusLabel,
        LocalDate scheduledDate,
        LocalDate completedDate,
        String technician,
        String provider,
        String description,
        BigDecimal cost,
        String observations,
        Instant deletedAt,
        Instant createdAt,
        Instant updatedAt,
        UUID createdBy,
        long version
) {
    public static MaintenanceResponse from(MaintenanceRecord record) {
        return new MaintenanceResponse(
                record.getId(),
                record.getCondominiumId(),
                record.getEquipment(),
                record.getEquipmentId(),
                record.getType(),
                record.getType().label(),
                record.getStatus(),
                record.getStatus().label(),
                record.getScheduledDate(),
                record.getCompletedDate(),
                record.getTechnician(),
                record.getProvider(),
                record.getDescription(),
                record.getCost(),
                record.getObservations(),
                record.getDeletedAt(),
                record.getCreatedAt(),
                record.getUpdatedAt(),
                record.getCreatedBy(),
                record.getVersion()
        );
    }
}
