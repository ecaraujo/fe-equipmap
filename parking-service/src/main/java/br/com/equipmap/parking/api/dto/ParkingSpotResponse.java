package br.com.equipmap.parking.api.dto;

import br.com.equipmap.parking.domain.ParkingSpot;
import br.com.equipmap.parking.domain.ParkingSpotType;

import java.time.Instant;
import java.util.UUID;

public record ParkingSpotResponse(
        UUID id,
        UUID condominiumId,
        String number,
        ParkingSpotType type,
        Instant createdAt,
        Instant updatedAt
) {
    public static ParkingSpotResponse from(ParkingSpot spot) {
        return new ParkingSpotResponse(spot.getId(), spot.getCondominiumId(), spot.getNumber(), spot.getType(),
                spot.getCreatedAt(), spot.getUpdatedAt());
    }
}
