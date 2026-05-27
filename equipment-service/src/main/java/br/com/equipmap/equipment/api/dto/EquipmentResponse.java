package br.com.equipmap.equipment.api.dto;

import br.com.equipmap.equipment.domain.Equipment;
import br.com.equipmap.equipment.domain.EquipmentStatus;
import br.com.equipmap.equipment.domain.EquipmentType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record EquipmentResponse(
        UUID id,
        UUID condominiumId,
        String name,
        EquipmentType type,
        String typeLabel,
        String brand,
        String model,
        String serialNumber,
        String patrimonyCode,
        String location,
        EquipmentStatus status,
        String statusLabel,
        LocalDate acquisitionDate,
        LocalDate warrantyExpiry,
        LocalDate lastMaintenance,
        LocalDate nextMaintenance,
        BigDecimal value,
        Instant deletedAt,
        Instant createdAt,
        Instant updatedAt,
        UUID createdBy
) {
    public static EquipmentResponse from(Equipment equipment) {
        return new EquipmentResponse(
                equipment.getId(),
                equipment.getCondominiumId(),
                equipment.getName(),
                equipment.getType(),
                equipment.getType().label(),
                equipment.getBrand(),
                equipment.getModel(),
                equipment.getSerialNumber(),
                equipment.getPatrimonyCode(),
                equipment.getLocation(),
                equipment.getStatus(),
                equipment.getStatus().label(),
                equipment.getAcquisitionDate(),
                equipment.getWarrantyExpiry(),
                equipment.getLastMaintenance(),
                equipment.getNextMaintenance(),
                equipment.getValue(),
                equipment.getDeletedAt(),
                equipment.getCreatedAt(),
                equipment.getUpdatedAt(),
                equipment.getCreatedBy()
        );
    }
}
