package br.com.equipmap.warranty.service;

import br.com.equipmap.core.constants.RabbitMqConstants;
import br.com.equipmap.warranty.domain.OutboxEvent;
import br.com.equipmap.warranty.domain.OutboxStatus;
import br.com.equipmap.warranty.repository.OutboxEventRepository;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageBuilder;
import org.springframework.amqp.core.MessageDeliveryMode;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class OutboxPublisher {
    private final OutboxEventRepository repository;
    private final RabbitTemplate rabbitTemplate;

    public OutboxPublisher(OutboxEventRepository repository, RabbitTemplate rabbitTemplate) {
        this.repository = repository;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Scheduled(fixedDelayString = "${equipmap.outbox.polling-delay-ms:5000}")
    @Transactional
    public void publishPending() {
        for (OutboxEvent event : repository.findByStatusInOrderByCreatedAtAsc(List.of(OutboxStatus.PENDING, OutboxStatus.FAILED), PageRequest.of(0, 50))) {
            try {
                Message message = MessageBuilder.withBody(event.getPayload().getBytes(StandardCharsets.UTF_8))
                        .setContentType(MessageProperties.CONTENT_TYPE_JSON)
                        .setDeliveryMode(MessageDeliveryMode.PERSISTENT)
                        .setHeader("eventId", event.getId().toString())
                        .build();
                rabbitTemplate.send(RabbitMqConstants.DOMAIN_EVENTS_EXCHANGE, event.getRoutingKey(), message);
                event.published();
            } catch (RuntimeException exception) {
                event.failed(exception);
            }
        }
    }
}
