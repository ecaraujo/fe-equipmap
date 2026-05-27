package br.com.equipmap.parking.api.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateApartmentRequest(
        @NotBlank String unit,
        String block,
        @NotBlank String owner,
        boolean hasVehicle
) {
}
