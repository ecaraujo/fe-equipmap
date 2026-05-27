package br.com.equipmap.maintenance.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "outbox_events")
public class OutboxEvent {
    @Id
    private UUID id = UUID.randomUUID();

    @Column(name = "aggregate_type", nullable = false, length = 80)
    private String aggregateType;

    @Column(name = "aggregate_id", nullable = false)
    private UUID aggregateId;

    @Column(name = "condominium_id", nullable = false)
    private UUID condominiumId;

    @Column(name = "routing_key", nullable = false, length = 120)
    private String routingKey;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String payload;

    @Column(name = "dedup_key", nullable = false, length = 220, unique = true)
    private String dedupKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OutboxStatus status = OutboxStatus.PENDING;

    @Column(nullable = false)
    private int attempts;

    @Column(name = "last_error", columnDefinition = "TEXT")
    private String lastError;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "published_at")
    private Instant publishedAt;

    protected OutboxEvent() {
    }

    public OutboxEvent(String aggregateType, UUID aggregateId, UUID condominiumId, String routingKey, String payload, String dedupKey) {
        this.aggregateType = aggregateType;
        this.aggregateId = aggregateId;
        this.condominiumId = condominiumId;
        this.routingKey = routingKey;
        this.payload = payload;
        this.dedupKey = dedupKey;
    }

    public void published() {
        status = OutboxStatus.PUBLISHED;
        publishedAt = Instant.now();
        lastError = null;
    }

    public void failed(Exception exception) {
        attempts++;
        status = OutboxStatus.FAILED;
        lastError = exception.getMessage();
    }

    public UUID getId() { return id; }
    public String getRoutingKey() { return routingKey; }
    public String getPayload() { return payload; }
}
