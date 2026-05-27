package br.com.equipmap.brigadier.service;

import br.com.equipmap.brigadier.api.dto.QueuedNotificationMessage;
import br.com.equipmap.brigadier.domain.NotificationLog;
import br.com.equipmap.brigadier.repository.NotificationLogRepository;
import br.com.equipmap.core.constants.RabbitMqConstants;
import br.com.equipmap.core.messaging.MessageDeliveryResult;
import br.com.equipmap.core.messaging.MessageRequest;
import br.com.equipmap.core.messaging.MessagingProvider;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class BrigadierNotificationWorker {
    private final NotificationLogRepository repository;
    private final MessagingProvider messagingProvider;

    public BrigadierNotificationWorker(NotificationLogRepository repository, ObjectProvider<MessagingProvider> messagingProvider) {
        this.repository = repository;
        this.messagingProvider = messagingProvider.getIfAvailable(() -> {
            throw new IllegalStateException("No MessagingProvider configured. Set equipmap.messaging.provider=sandbox for local/MVP execution or configure a real messaging provider.");
        });
    }

    @RabbitListener(queues = RabbitMqConstants.BRIGADIER_NOTIFICATION_QUEUE)
    @Transactional
    public void process(QueuedNotificationMessage message) {
        NotificationLog log = repository.findById(message.notificationLogId()).orElseThrow();
        MessageDeliveryResult result = messagingProvider.send(new MessageRequest(
                log.getBrigadierId().toString(),
                log.getRecipientName(),
                log.getDestination(),
                log.getChannel(),
                log.getMessage(),
                Map.of("condominiumId", log.getCondominiumId().toString())
        ));
        log.applyDelivery(result);
    }
}
