package br.com.equipmap.brigadier.api.dto;

import br.com.equipmap.brigadier.domain.NotificationLog;
import br.com.equipmap.brigadier.domain.NotificationStatus;
import br.com.equipmap.core.messaging.MessageChannel;

import java.time.Instant;
import java.util.UUID;

public record NotificationLogResponse(
        UUID id,
        UUID brigadierId,
        String recipientName,
        String destination,
        MessageChannel channel,
        String message,
        NotificationStatus status,
        String providerMessageId,
        String errorCode,
        String errorMessage,
        int attempts,
        Instant createdAt,
        Instant sentAt
) {
    public static NotificationLogResponse from(NotificationLog log) {
        return new NotificationLogResponse(log.getId(), log.getBrigadierId(), log.getRecipientName(), log.getDestination(),
                log.getChannel(), log.getMessage(), log.getStatus(), log.getProviderMessageId(), log.getErrorCode(),
                log.getErrorMessage(), log.getAttempts(), log.getCreatedAt(), log.getSentAt());
    }
}
