package br.com.equipmap.parking.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateApartmentRequest(
        @NotBlank String unit,
        @NotBlank String block,
        Integer floor,
        String ownerName,
        String owner,
        @Size(max = 32) String ownerDocument,
        String ownerPhone,
        @jakarta.validation.constraints.Email String ownerEmail,
        boolean isRented,
        String tenantName,
        @Size(max = 32) String tenantDocument,
        String tenantPhone,
        @jakarta.validation.constraints.Email String tenantEmail,
        LocalDate rentalStart,
        LocalDate rentalEnd,
        boolean hasVehicle,
        @Size(max = 1000) String observations
) {
    public CreateApartmentRequest(String unit, String block, String owner, boolean hasVehicle) {
        this(unit, block, null, owner, owner, null, null, null, false,
                null, null, null, null, null, null, hasVehicle, null);
    }
}
