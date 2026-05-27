package br.com.equipmap.maintenance.api.dto;

import br.com.equipmap.maintenance.domain.MaintenanceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record CreateMaintenanceRequest(
        @NotBlank String equipment,
        UUID equipmentId,
        @NotNull MaintenanceType type,
        @NotNull LocalDate scheduledDate,
        String technician,
        String provider,
        @NotBlank String description
) {
}
