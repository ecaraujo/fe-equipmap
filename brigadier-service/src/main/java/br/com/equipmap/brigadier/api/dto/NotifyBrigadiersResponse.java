package br.com.equipmap.brigadier.api.dto;

import java.util.List;
import java.util.UUID;

public record NotifyBrigadiersResponse(
        int requested,
        int enqueued,
        List<UUID> skippedInactive
) {
}
