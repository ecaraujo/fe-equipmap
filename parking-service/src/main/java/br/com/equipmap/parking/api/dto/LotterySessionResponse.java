package br.com.equipmap.parking.api.dto;

import br.com.equipmap.parking.domain.LotterySession;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record LotterySessionResponse(
        UUID id,
        UUID condominiumId,
        long seed,
        Instant drawnAt,
        String undrawnApartments,
        List<LotteryResultResponse> results
) {
    public static LotterySessionResponse from(LotterySession session) {
        return new LotterySessionResponse(session.getId(), session.getCondominiumId(), session.getSeed(), session.getDrawnAt(),
                session.getUndrawnApartments(), session.getResults().stream().map(LotteryResultResponse::from).toList());
    }
}
