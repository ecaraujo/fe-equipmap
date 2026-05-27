package br.com.equipmap.notification.service;

import br.com.equipmap.notification.domain.NotificationSeverity;
import br.com.equipmap.notification.domain.NotificationType;

import java.util.UUID;

record NotificationEventData(
        NotificationType type,
        NotificationSeverity severity,
        String resourceId,
        UUID condominiumId,
        UUID userId,
        String title,
        String message,
        String payload
) {
}
