package br.com.equipmap.core.events;

import java.time.Instant;
import java.util.UUID;

public record WarrantyExpiredEvent(
        UUID eventId,
        String warrantyId,
        String equipmentId,
        String condominiumId,
        Instant warrantyEnd,
        EventSeverity severity,
        Instant occurredAt
) {
}
