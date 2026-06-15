package br.com.equipmap.parking.domain;

import java.time.LocalDate;

public record ApartmentDetails(
        String unit,
        String block,
        Integer floor,
        String ownerName,
        String ownerDocument,
        String ownerPhone,
        String ownerEmail,
        boolean rented,
        String tenantName,
        String tenantDocument,
        String tenantPhone,
        String tenantEmail,
        LocalDate rentalStart,
        LocalDate rentalEnd,
        boolean hasVehicle,
        String observations
) {
}
