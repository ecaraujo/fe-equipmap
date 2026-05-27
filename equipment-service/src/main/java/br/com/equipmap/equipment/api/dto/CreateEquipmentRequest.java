package br.com.equipmap.equipment.api.dto;

import br.com.equipmap.equipment.domain.EquipmentStatus;
import br.com.equipmap.equipment.domain.EquipmentType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateEquipmentRequest(
        @NotBlank String name,
        @NotNull EquipmentType type,
        @NotBlank String brand,
        @NotBlank String model,
        @NotBlank String serialNumber,
        @NotBlank String location,
        EquipmentStatus status,
        @NotNull LocalDate acquisitionDate,
        @NotNull LocalDate warrantyExpiry,
        @NotNull LocalDate nextMaintenance,
        @NotNull @DecimalMin("0.00") BigDecimal value
) {
}
