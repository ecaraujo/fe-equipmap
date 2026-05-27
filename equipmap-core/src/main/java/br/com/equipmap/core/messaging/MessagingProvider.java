package br.com.equipmap.core.messaging;

public interface MessagingProvider {
    MessageDeliveryResult send(MessageRequest request);

    MessageDeliveryStatus getDeliveryStatus(String providerMessageId);
}
