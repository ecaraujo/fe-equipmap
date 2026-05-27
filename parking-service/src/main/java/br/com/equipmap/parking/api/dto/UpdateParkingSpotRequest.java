package br.com.equipmap.parking.api.dto;

import br.com.equipmap.parking.domain.ParkingSpotType;

public record UpdateParkingSpotRequest(
        String number,
        ParkingSpotType type
) {
}
