package br.com.equipmap.maintenance.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CompleteMaintenanceRequest(
        @NotNull LocalDate completedDate,
        @DecimalMin("0.00") BigDecimal cost,
        String observations
) {
}
