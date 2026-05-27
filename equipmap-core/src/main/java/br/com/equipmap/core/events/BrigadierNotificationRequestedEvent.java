package br.com.equipmap.core.events;

import br.com.equipmap.core.messaging.MessageChannel;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record BrigadierNotificationRequestedEvent(
        UUID eventId,
        String condominiumId,
        String requestedByUserId,
        List<String> recipientIds,
        MessageChannel channel,
        String message,
        Instant requestedAt
) {
}
