package br.com.equipmap.notification.service;

import br.com.equipmap.core.constants.RoutingKeys;
import br.com.equipmap.core.error.ErrorDetail;
import br.com.equipmap.core.error.ValidationException;
import br.com.equipmap.notification.config.RabbitMqConfig;
import br.com.equipmap.notification.domain.NotificationSeverity;
import br.com.equipmap.notification.domain.NotificationType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.List;

@Component
public class NotificationEventMapper {
    private final ObjectMapper objectMapper;
    private final UUID defaultUserId;

    public NotificationEventMapper(ObjectMapper objectMapper,
                                   @Value("${equipmap.notification.default-user-id}") UUID defaultUserId) {
        this.objectMapper = objectMapper;
        this.defaultUserId = defaultUserId;
    }

    NotificationEventData map(String routingKey, JsonNode payload) {
        return switch (routingKey) {
            case RoutingKeys.MAINTENANCE_OVERDUE -> maintenance(payload, NotificationType.MAINTENANCE_OVERDUE, NotificationSeverity.HIGH);
            case RabbitMqConfig.MAINTENANCE_PENDING_ROUTING_KEY -> maintenance(payload, NotificationType.MAINTENANCE_PENDING, NotificationSeverity.MEDIUM);
            case RoutingKeys.WARRANTY_EXPIRING -> warranty(payload, NotificationType.WARRANTY_EXPIRING, NotificationSeverity.MEDIUM);
            case RoutingKeys.WARRANTY_EXPIRED -> warranty(payload, NotificationType.WARRANTY_EXPIRED, NotificationSeverity.HIGH);
            default -> throw validation("routingKey", "Unsupported notification event routing key: " + routingKey);
        };
    }

    private NotificationEventData maintenance(JsonNode payload, NotificationType type, NotificationSeverity severity) {
        String maintenanceId = requiredText(payload, "maintenanceId");
        UUID condominiumId = requiredUuid(payload, "condominiumId");
        UUID userId = optionalUuid(payload, "userId", defaultUserId);
        String equipmentId = text(payload, "equipmentId", "unknown equipment");
        String title = type == NotificationType.MAINTENANCE_OVERDUE ? "Maintenance overdue" : "Maintenance pending";
        String message = type == NotificationType.MAINTENANCE_OVERDUE
                ? "Maintenance " + maintenanceId + " is overdue for equipment " + equipmentId + "."
                : "Maintenance " + maintenanceId + " is pending for equipment " + equipmentId + ".";
        return new NotificationEventData(type, severity, maintenanceId, condominiumId, userId, title, message, payloadToText(payload));
    }

    private NotificationEventData warranty(JsonNode payload, NotificationType type, NotificationSeverity severity) {
        String warrantyId = requiredText(payload, "warrantyId");
        UUID condominiumId = requiredUuid(payload, "condominiumId");
        UUID userId = optionalUuid(payload, "userId", defaultUserId);
        String equipmentId = text(payload, "equipmentId", "unknown equipment");
        String title = type == NotificationType.WARRANTY_EXPIRED ? "Warranty expired" : "Warranty expiring";
        String message = type == NotificationType.WARRANTY_EXPIRED
                ? "Warranty " + warrantyId + " has expired for equipment " + equipmentId + "."
                : "Warranty " + warrantyId + " is expiring for equipment " + equipmentId + ".";
        return new NotificationEventData(type, severity, warrantyId, condominiumId, userId, title, message, payloadToText(payload));
    }

    private String requiredText(JsonNode payload, String field) {
        String value = text(payload, field, null);
        if (value == null || value.isBlank()) throw validation(field, "Missing event field: " + field);
        return value;
    }

    private UUID requiredUuid(JsonNode payload, String field) {
        try {
            return UUID.fromString(requiredText(payload, field));
        } catch (IllegalArgumentException exception) {
            throw validation(field, "Invalid event field: " + field);
        }
    }

    private UUID optionalUuid(JsonNode payload, String field, UUID fallback) {
        String value = text(payload, field, null);
        if (value == null || value.isBlank()) return fallback;
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException exception) {
            throw validation(field, "Invalid event field: " + field);
        }
    }

    private String text(JsonNode payload, String field, String fallback) {
        JsonNode value = payload == null ? null : payload.get(field);
        return value == null || value.isNull() ? fallback : value.asText();
    }

    private String payloadToText(JsonNode payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (Exception exception) {
            return "{}";
        }
    }

    private ValidationException validation(String field, String message) {
        return new ValidationException(message, List.of(new ErrorDetail(field, message)));
    }
}
