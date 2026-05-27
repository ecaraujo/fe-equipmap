package br.com.equipmap.parking.api.dto;

import br.com.equipmap.parking.domain.ParkingSpotType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateParkingSpotRequest(
        @NotBlank String number,
        @NotNull ParkingSpotType type
) {
}
