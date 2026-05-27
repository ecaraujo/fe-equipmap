package br.com.equipmap.notification.api.dto;

import br.com.equipmap.notification.domain.Notification;
import br.com.equipmap.notification.domain.NotificationSeverity;
import br.com.equipmap.notification.domain.NotificationType;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        UUID condominiumId,
        UUID userId,
        NotificationType type,
        NotificationSeverity severity,
        String resourceId,
        String title,
        String message,
        boolean read,
        Instant createdAt,
        Instant readAt
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getCondominiumId(),
                notification.getUserId(),
                notification.getType(),
                notification.getSeverity(),
                notification.getResourceId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.isRead(),
                notification.getCreatedAt(),
                notification.getReadAt()
        );
    }
}
