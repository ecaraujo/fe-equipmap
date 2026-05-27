package br.com.equipmap.equipment.config;

import br.com.equipmap.core.constants.RabbitMqConstants;
import br.com.equipmap.core.constants.RoutingKeys;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {
    public static final String EQUIPMENT_MAINTENANCE_DUE_QUEUE = "equipmap.equipment.maintenance-due";
    public static final String EQUIPMENT_WARRANTY_EXPIRING_QUEUE = "equipmap.equipment.warranty-expiring";

    @Bean
    DirectExchange domainEventsExchange() {
        return new DirectExchange(RabbitMqConstants.DOMAIN_EVENTS_EXCHANGE, true, false);
    }

    @Bean
    Queue maintenanceCompletedQueue() {
        return new Queue(RabbitMqConstants.MAINTENANCE_COMPLETED_QUEUE, true);
    }

    @Bean
    Queue equipmentMaintenanceDueQueue() {
        return new Queue(EQUIPMENT_MAINTENANCE_DUE_QUEUE, true);
    }

    @Bean
    Queue equipmentWarrantyExpiringQueue() {
        return new Queue(EQUIPMENT_WARRANTY_EXPIRING_QUEUE, true);
    }

    @Bean
    Binding maintenanceCompletedBinding(Queue maintenanceCompletedQueue, DirectExchange domainEventsExchange) {
        return BindingBuilder.bind(maintenanceCompletedQueue)
                .to(domainEventsExchange)
                .with(RoutingKeys.MAINTENANCE_COMPLETED);
    }

    @Bean
    Binding equipmentMaintenanceDueBinding(Queue equipmentMaintenanceDueQueue, DirectExchange domainEventsExchange) {
        return BindingBuilder.bind(equipmentMaintenanceDueQueue)
                .to(domainEventsExchange)
                .with(RoutingKeys.EQUIPMENT_MAINTENANCE_DUE);
    }

    @Bean
    Binding equipmentWarrantyExpiringBinding(Queue equipmentWarrantyExpiringQueue, DirectExchange domainEventsExchange) {
        return BindingBuilder.bind(equipmentWarrantyExpiringQueue)
                .to(domainEventsExchange)
                .with(RoutingKeys.EQUIPMENT_WARRANTY_EXPIRING);
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

    @Bean
    SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jsonMessageConverter);
        return factory;
    }
}
