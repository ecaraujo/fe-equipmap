package br.com.equipmap.brigadier.service;

import br.com.equipmap.core.messaging.MessageDeliveryResult;
import br.com.equipmap.core.messaging.MessageDeliveryStatus;
import br.com.equipmap.core.messaging.MessageRequest;
import br.com.equipmap.core.messaging.MessagingProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@ConditionalOnProperty(prefix = "equipmap.messaging", name = "provider", havingValue = "sandbox")
public class SandboxMessagingProvider implements MessagingProvider {
    @Override
    public MessageDeliveryResult send(MessageRequest request) {
        if (request.destination() == null || request.destination().contains("0000")) {
            return new MessageDeliveryResult(null, MessageDeliveryStatus.FAILED, "INVALID_DESTINATION", "Invalid sandbox destination", Instant.now());
        }
        return new MessageDeliveryResult(UUID.randomUUID().toString(), MessageDeliveryStatus.SENT, null, null, Instant.now());
    }

    @Override
    public MessageDeliveryStatus getDeliveryStatus(String providerMessageId) {
        return MessageDeliveryStatus.DELIVERED;
    }
}
