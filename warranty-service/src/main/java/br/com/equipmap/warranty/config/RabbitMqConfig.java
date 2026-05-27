package br.com.equipmap.warranty.config;

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
    Queue warrantyExpiringQueue() {
        return new Queue(RabbitMqConstants.WARRANTY_EXPIRING_QUEUE, true);
    }

    @Bean
    Queue warrantyExpiredQueue() {
        return new Queue(RabbitMqConstants.WARRANTY_EXPIRED_QUEUE, true);
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
        return rabbitTemplate;
    }
}
