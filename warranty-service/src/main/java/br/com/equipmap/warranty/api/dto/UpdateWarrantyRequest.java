package br.com.equipmap.warranty.api.dto;

import br.com.equipmap.warranty.domain.WarrantyType;

import java.time.LocalDate;
import java.util.UUID;

public record UpdateWarrantyRequest(
        String equipment,
        UUID equipmentId,
        String brand,
        String model,
        String serialNumber,
        String supplier,
        String supplierContact,
        LocalDate purchaseDate,
        LocalDate warrantyStart,
        LocalDate warrantyEnd,
        Integer warrantyMonths,
        WarrantyType type,
        String observations
) {
}
