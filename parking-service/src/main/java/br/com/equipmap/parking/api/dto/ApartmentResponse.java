package br.com.equipmap.parking.api.dto;

import br.com.equipmap.parking.domain.Apartment;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ApartmentResponse(
        UUID id,
        UUID condominiumId,
        String unit,
        String block,
        Integer floor,
        String ownerName,
        String owner,
        String ownerDocument,
        String ownerPhone,
        String ownerEmail,
        boolean isRented,
        String tenantName,
        String tenantDocument,
        String tenantPhone,
        String tenantEmail,
        LocalDate rentalStart,
        LocalDate rentalEnd,
        boolean hasVehicle,
        String observations,
        Instant createdAt,
        Instant updatedAt
) {
    public static ApartmentResponse from(Apartment apartment) {
        return new ApartmentResponse(apartment.getId(), apartment.getCondominiumId(), apartment.getUnit(), apartment.getBlock(),
                apartment.getFloor(), apartment.getOwnerName(), apartment.getOwner(), apartment.getOwnerDocument(),
                apartment.getOwnerPhone(), apartment.getOwnerEmail(), apartment.isRented(), apartment.getTenantName(),
                apartment.getTenantDocument(), apartment.getTenantPhone(), apartment.getTenantEmail(),
                apartment.getRentalStart(), apartment.getRentalEnd(), apartment.isHasVehicle(),
                apartment.getObservations(), apartment.getCreatedAt(), apartment.getUpdatedAt());
    }
}
