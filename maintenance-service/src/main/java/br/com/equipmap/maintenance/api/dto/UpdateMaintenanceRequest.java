package br.com.equipmap.maintenance.api.dto;

import br.com.equipmap.maintenance.domain.MaintenanceType;

import java.time.LocalDate;
import java.util.UUID;

public record UpdateMaintenanceRequest(
        String equipment,
        UUID equipmentId,
        MaintenanceType type,
        LocalDate scheduledDate,
        String technician,
        String provider,
        String description
) {
}
