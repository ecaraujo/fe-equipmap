package br.com.equipmap.notification.service;

import br.com.equipmap.core.constants.RabbitMqConstants;
import br.com.equipmap.core.constants.RoutingKeys;
import br.com.equipmap.notification.config.RabbitMqConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.rabbitmq.client.Channel;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class NotificationEventListener {
    private final NotificationService notificationService;

    public NotificationEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = RabbitMqConstants.MAINTENANCE_OVERDUE_QUEUE)
    public void maintenanceOverdue(JsonNode payload, Channel channel, Message message) throws IOException {
        handle(RoutingKeys.MAINTENANCE_OVERDUE, payload, channel, message);
    }

    @RabbitListener(queues = RabbitMqConfig.MAINTENANCE_PENDING_QUEUE)
    public void maintenancePending(JsonNode payload, Channel channel, Message message) throws IOException {
        handle(RabbitMqConfig.MAINTENANCE_PENDING_ROUTING_KEY, payload, channel, message);
    }

    @RabbitListener(queues = RabbitMqConstants.WARRANTY_EXPIRING_QUEUE)
    public void warrantyExpiring(JsonNode payload, Channel channel, Message message) throws IOException {
        handle(RoutingKeys.WARRANTY_EXPIRING, payload, channel, message);
    }

    @RabbitListener(queues = RabbitMqConstants.WARRANTY_EXPIRED_QUEUE)
    public void warrantyExpired(JsonNode payload, Channel channel, Message message) throws IOException {
        handle(RoutingKeys.WARRANTY_EXPIRED, payload, channel, message);
    }

    private void handle(String routingKey, JsonNode payload, Channel channel, Message message) throws IOException {
        long tag = message.getMessageProperties().getDeliveryTag();
        try {
            notificationService.handleEvent(routingKey, payload);
            channel.basicAck(tag, false);
        } catch (RuntimeException exception) {
            channel.basicNack(tag, false, true);
            throw exception;
        }
    }
}
