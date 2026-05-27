package br.com.equipmap.core.events;

import java.time.Instant;
import java.util.UUID;

public record WarrantyExpiringEvent(
        UUID eventId,
        String warrantyId,
        String equipmentId,
        String condominiumId,
        Instant warrantyEnd,
        int daysUntilExpiration,
        EventSeverity severity,
        Instant occurredAt
) {
}
