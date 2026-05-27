package br.com.equipmap.core.messaging;

import java.util.Map;

public record MessageRequest(
        String recipientId,
        String recipientName,
        String destination,
        MessageChannel channel,
        String message,
        Map<String, String> metadata
) {
}
