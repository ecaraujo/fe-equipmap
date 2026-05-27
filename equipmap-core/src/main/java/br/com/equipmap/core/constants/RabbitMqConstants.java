package br.com.equipmap.core.constants;

public final class RabbitMqConstants {
    public static final String DOMAIN_EVENTS_EXCHANGE = "equipmap.domain.events";
    public static final String NOTIFICATIONS_EXCHANGE = "equipmap.notifications";
    public static final String BRIGADIER_EXCHANGE = "equipmap.brigadier";

    public static final String MAINTENANCE_COMPLETED_QUEUE = "equipmap.maintenance.completed";
    public static final String MAINTENANCE_OVERDUE_QUEUE = "equipmap.maintenance.overdue";
    public static final String WARRANTY_EXPIRING_QUEUE = "equipmap.warranty.expiring";
    public static final String WARRANTY_EXPIRED_QUEUE = "equipmap.warranty.expired";
    public static final String BRIGADIER_NOTIFICATION_QUEUE = "equipmap.brigadier.notification.requested";

    public static final String DEAD_LETTER_EXCHANGE = "equipmap.dead-letter";
    public static final String DEAD_LETTER_QUEUE = "equipmap.dead-letter.queue";

    private RabbitMqConstants() {
    }
}
