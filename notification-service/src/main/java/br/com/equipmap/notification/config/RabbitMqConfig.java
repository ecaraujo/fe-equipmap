package br.com.equipmap.notification.config;

import br.com.equipmap.core.constants.RabbitMqConstants;
import br.com.equipmap.core.constants.RoutingKeys;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.MessageDeliveryMode;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.core.AcknowledgeMode;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {
    public static final String MAINTENANCE_PENDING_QUEUE = "equipmap.maintenance.pending";
    public static final String MAINTENANCE_PENDING_ROUTING_KEY = "maintenance.pending";

    @Bean
    DirectExchange domainEventsExchange() {
        return new DirectExchange(RabbitMqConstants.DOMAIN_EVENTS_EXCHANGE, true, false);
    }

    @Bean
    Queue maintenanceOverdueQueue() {
        return QueueBuilder.durable(RabbitMqConstants.MAINTENANCE_OVERDUE_QUEUE).build();
    }

    @Bean
    Queue maintenancePendingQueue() {
        return QueueBuilder.durable(MAINTENANCE_PENDING_QUEUE).build();
    }

    @Bean
    Queue warrantyExpiringQueue() {
        return QueueBuilder.durable(RabbitMqConstants.WARRANTY_EXPIRING_QUEUE).build();
    }

    @Bean
    Queue warrantyExpiredQueue() {
        return QueueBuilder.durable(RabbitMqConstants.WARRANTY_EXPIRED_QUEUE).build();
    }

    @Bean
    Binding maintenanceOverdueBinding(Queue maintenanceOverdueQueue, DirectExchange domainEventsExchange) {
        return BindingBuilder.bind(maintenanceOverdueQueue).to(domainEventsExchange).with(RoutingKeys.MAINTENANCE_OVERDUE);
    }

    @Bean
    Binding maintenancePendingBinding(Queue maintenancePendingQueue, DirectExchange domainEventsExchange) {
        return BindingBuilder.bind(maintenancePendingQueue).to(domainEventsExchange).with(MAINTENANCE_PENDING_ROUTING_KEY);
    }

    @Bean
    Binding warrantyExpiringBinding(Queue warrantyExpiringQueue, DirectExchange domainEventsExchange) {
        return BindingBuilder.bind(warrantyExpiringQueue).to(domainEventsExchange).with(RoutingKeys.WARRANTY_EXPIRING);
    }

    @Bean
    Binding warrantyExpiredBinding(Queue warrantyExpiredQueue, DirectExchange domainEventsExchange) {
        return BindingBuilder.bind(warrantyExpiredQueue).to(domainEventsExchange).with(RoutingKeys.WARRANTY_EXPIRED);
    }

    @Bean
    MessageConverter jsonMessageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter);
        rabbitTemplate.setBeforePublishPostProcessors(message -> {
            message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
            return message;
        });
        return rabbitTemplate;
    }

    @Bean
    SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(ConnectionFactory connectionFactory,
                                                                        MessageConverter jsonMessageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jsonMessageConverter);
        factory.setAcknowledgeMode(AcknowledgeMode.MANUAL);
        return factory;
    }
}
