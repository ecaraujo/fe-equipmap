package br.com.equipmap.parking.api.dto;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateApartmentRequest(
        String unit,
        String block,
        Integer floor,
        String ownerName,
        String owner,
        @Size(max = 32) String ownerDocument,
        String ownerPhone,
        @jakarta.validation.constraints.Email String ownerEmail,
        Boolean isRented,
        String tenantName,
        @Size(max = 32) String tenantDocument,
        String tenantPhone,
        @jakarta.validation.constraints.Email String tenantEmail,
        LocalDate rentalStart,
        LocalDate rentalEnd,
        Boolean hasVehicle,
        @Size(max = 1000) String observations
) {
    public UpdateApartmentRequest(String unit, String block, String owner, Boolean hasVehicle) {
        this(unit, block, null, owner, owner, null, null, null, null,
                null, null, null, null, null, null, hasVehicle, null);
    }
}
