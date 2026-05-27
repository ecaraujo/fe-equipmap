package br.com.equipmap.core.events;

import java.time.Instant;
import java.util.UUID;

public record MaintenanceCompletedEvent(
        UUID eventId,
        String maintenanceId,
        String equipmentId,
        String condominiumId,
        Instant completedDate,
        Instant occurredAt
) {
}
