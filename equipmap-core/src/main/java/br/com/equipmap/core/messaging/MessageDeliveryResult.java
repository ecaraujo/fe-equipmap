package br.com.equipmap.core.messaging;

import java.time.Instant;

public record MessageDeliveryResult(
        String providerMessageId,
        MessageDeliveryStatus status,
        String errorCode,
        String errorMessage,
        Instant sentAt
) {
}
