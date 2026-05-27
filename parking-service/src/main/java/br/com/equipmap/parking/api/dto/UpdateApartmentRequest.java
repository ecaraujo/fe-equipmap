package br.com.equipmap.parking.api.dto;

public record UpdateApartmentRequest(
        String unit,
        String block,
        String owner,
        Boolean hasVehicle
) {
}
