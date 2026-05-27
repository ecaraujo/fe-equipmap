package br.com.equipmap.maintenance.config;

import br.com.equipmap.core.constants.RabbitMqConstants;
import br.com.equipmap.core.constants.RoutingKeys;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {
    @Bean
    DirectExchange domainEventsExchange() {
        return new DirectExchange(RabbitMqConstants.DOMAIN_EVENTS_EXCHANGE, true, false);
    }

    @Bean
    Queue maintenanceCompletedQueue() {
        return new Queue(RabbitMqConstants.MAINTENANCE_COMPLETED_QUEUE, true);
    }

    @Bean
    Queue maintenanceOverdueQueue() {
        return new Queue(RabbitMqConstants.MAINTENANCE_OVERDUE_QUEUE, true);
    }

    @Bean
    Binding maintenanceCompletedBinding(Queue maintenanceCompletedQueue, DirectExchange domainEventsExchange) {
        return BindingBuilder.bind(maintenanceCompletedQueue).to(domainEventsExchange).with(RoutingKeys.MAINTENANCE_COMPLETED);
    }

    @Bean
    Binding maintenanceOverdueBinding(Queue maintenanceOverdueQueue, DirectExchange domainEventsExchange) {
        return BindingBuilder.bind(maintenanceOverdueQueue).to(domainEventsExchange).with(RoutingKeys.MAINTENANCE_OVERDUE);
    }

    @Bean
    MessageConverter jsonMessageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter);
        return rabbitTemplate;
    }
}
