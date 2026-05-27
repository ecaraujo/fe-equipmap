package br.com.equipmap.parking.api.dto;

import br.com.equipmap.parking.domain.LotteryResult;
import br.com.equipmap.parking.domain.ParkingSpotType;

import java.time.Instant;
import java.util.UUID;

public record LotteryResultResponse(
        UUID id,
        UUID apartmentId,
        UUID parkingSpotId,
        String unit,
        String block,
        String owner,
        String spotNumber,
        ParkingSpotType spotType,
        long seed,
        Instant drawnAt
) {
    public static LotteryResultResponse from(LotteryResult result) {
        return new LotteryResultResponse(result.getId(), result.getApartmentId(), result.getParkingSpotId(), result.getUnit(),
                result.getBlock(), result.getOwner(), result.getSpotNumber(), result.getSpotType(), result.getSeed(), result.getDrawnAt());
    }
}
