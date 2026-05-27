package br.com.equipmap.warranty.api.dto;

import br.com.equipmap.warranty.domain.WarrantyType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record CreateWarrantyRequest(
        @NotBlank String equipment,
        UUID equipmentId,
        @NotBlank String brand,
        @NotBlank String model,
        String serialNumber,
        @NotBlank String supplier,
        String supplierContact,
        @NotNull LocalDate purchaseDate,
        @NotNull LocalDate warrantyStart,
        @NotNull LocalDate warrantyEnd,
        @NotNull @Min(1) Integer warrantyMonths,
        @NotNull WarrantyType type,
        String observations
) {
}
