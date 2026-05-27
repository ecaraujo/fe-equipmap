package br.com.equipmap.brigadier.config;

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
    DirectExchange brigadierExchange() {
        return new DirectExchange(RabbitMqConstants.BRIGADIER_EXCHANGE, true, false);
    }

    @Bean
    DirectExchange deadLetterExchange() {
        return new DirectExchange(RabbitMqConstants.DEAD_LETTER_EXCHANGE, true, false);
    }

    @Bean
    Queue brigadierNotificationQueue() {
        return QueueBuilder.durable(RabbitMqConstants.BRIGADIER_NOTIFICATION_QUEUE)
                .withArgument("x-dead-letter-exchange", RabbitMqConstants.DEAD_LETTER_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", RoutingKeys.BRIGADIER_NOTIFICATION_REQUESTED)
                .build();
    }

    @Bean
    Queue deadLetterQueue() {
        return QueueBuilder.durable(RabbitMqConstants.DEAD_LETTER_QUEUE).build();
    }

    @Bean
    Binding brigadierNotificationBinding(Queue brigadierNotificationQueue, DirectExchange brigadierExchange) {
        return BindingBuilder.bind(brigadierNotificationQueue).to(brigadierExchange).with(RoutingKeys.BRIGADIER_NOTIFICATION_REQUESTED);
    }

    @Bean
    Binding deadLetterBinding(Queue deadLetterQueue, DirectExchange deadLetterExchange) {
        return BindingBuilder.bind(deadLetterQueue).to(deadLetterExchange).with(RoutingKeys.BRIGADIER_NOTIFICATION_REQUESTED);
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
