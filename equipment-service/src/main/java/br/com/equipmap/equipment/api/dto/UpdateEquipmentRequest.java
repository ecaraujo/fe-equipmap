package br.com.equipmap.equipment.api.dto;

import br.com.equipmap.equipment.domain.EquipmentStatus;
import br.com.equipmap.equipment.domain.EquipmentType;
import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateEquipmentRequest(
        String name,
        EquipmentType type,
        String brand,
        String model,
        String serialNumber,
        String location,
        EquipmentStatus status,
        LocalDate acquisitionDate,
        LocalDate warrantyExpiry,
        LocalDate nextMaintenance,
        @DecimalMin("0.00") BigDecimal value
) {
}
