package br.com.equipmap.equipment.service;

import br.com.equipmap.core.events.EventSeverity;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public final class EquipmentEvents {
    private EquipmentEvents() {
    }

    public record EquipmentMaintenanceDueEvent(
            UUID eventId,
            String equipmentId,
            String condominiumId,
            LocalDate nextMaintenance,
            EventSeverity severity,
            Instant occurredAt
    ) {
    }

    public record EquipmentWarrantyExpiringEvent(
            UUID eventId,
            String equipmentId,
            String condominiumId,
            LocalDate warrantyExpiry,
            int daysUntilExpiration,
            EventSeverity severity,
            Instant occurredAt
    ) {
    }
}
