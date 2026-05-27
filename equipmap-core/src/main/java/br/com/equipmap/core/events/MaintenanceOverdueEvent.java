package br.com.equipmap.core.events;

import java.time.Instant;
import java.util.UUID;

public record MaintenanceOverdueEvent(
        UUID eventId,
        String maintenanceId,
        String equipmentId,
        String condominiumId,
        Instant scheduledDate,
        EventSeverity severity,
        Instant occurredAt
) {
}
