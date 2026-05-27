package br.com.equipmap.notification.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID condominiumId;

    @Column(nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 60)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationSeverity severity;

    @Column(nullable = false, length = 120)
    private String resourceId;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @Column(nullable = false, length = 320)
    private String dedupKey;

    @Column(columnDefinition = "text")
    private String payload;

    @Column(name = "read", nullable = false)
    private boolean read;

    private Instant readAt;
    private Instant deletedAt;

    @Column(nullable = false)
    private Instant createdAt;

    protected Notification() {
    }

    public Notification(UUID condominiumId, UUID userId, NotificationType type, NotificationSeverity severity,
                        String resourceId, String title, String message, String payload) {
        this.id = UUID.randomUUID();
        this.condominiumId = condominiumId;
        this.userId = userId;
        this.type = type;
        this.severity = severity;
        this.resourceId = resourceId;
        this.title = title;
        this.message = message;
        this.payload = payload;
        this.dedupKey = dedupKey(type, resourceId, userId, condominiumId);
        this.read = false;
    }

    public static String dedupKey(NotificationType type, String resourceId, UUID userId, UUID condominiumId) {
        return type.name() + ":" + resourceId + ":" + userId + ":" + condominiumId;
    }

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
    }

    public void markRead() {
        if (!read) {
            read = true;
            readAt = Instant.now();
        }
    }

    public void delete() {
        if (deletedAt == null) {
            deletedAt = Instant.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public UUID getCondominiumId() {
        return condominiumId;
    }

    public UUID getUserId() {
        return userId;
    }

    public NotificationType getType() {
        return type;
    }

    public NotificationSeverity getSeverity() {
        return severity;
    }

    public String getResourceId() {
        return resourceId;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public String getDedupKey() {
        return dedupKey;
    }

    public String getPayload() {
        return payload;
    }

    public boolean isRead() {
        return read;
    }

    public Instant getReadAt() {
        return readAt;
    }

    public Instant getDeletedAt() {
        return deletedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
