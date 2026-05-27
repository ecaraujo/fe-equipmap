package br.com.equipmap.parking.api.dto;

import br.com.equipmap.parking.domain.Apartment;

import java.time.Instant;
import java.util.UUID;

public record ApartmentResponse(
        UUID id,
        UUID condominiumId,
        String unit,
        String block,
        String owner,
        boolean hasVehicle,
        Instant createdAt,
        Instant updatedAt
) {
    public static ApartmentResponse from(Apartment apartment) {
        return new ApartmentResponse(apartment.getId(), apartment.getCondominiumId(), apartment.getUnit(), apartment.getBlock(),
                apartment.getOwner(), apartment.isHasVehicle(), apartment.getCreatedAt(), apartment.getUpdatedAt());
    }
}
