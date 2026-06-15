package br.com.equipmap.warranty.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "outbox_events")
public class OutboxEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 80)
    private String aggregateType;

    @Column(nullable = false)
    private UUID aggregateId;

    @Column(nullable = false)
    private UUID condominiumId;

    @Column(nullable = false, length = 120)
    private String routingKey;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String payload;

    @Column(nullable = false, unique = true, length = 220)
    private String dedupKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OutboxStatus status = OutboxStatus.PENDING;

    @Column(nullable = false)
    private int attempts = 0;

    @Column(columnDefinition = "TEXT")
    private String lastError;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

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
        this.status = OutboxStatus.PUBLISHED;
        this.publishedAt = Instant.now();
        this.lastError = null;
    }

    public void failed(RuntimeException exception) {
        this.status = OutboxStatus.FAILED;
        this.attempts++;
        this.lastError = exception.getMessage();
    }

    public UUID getId() { return id; }
    public UUID getAggregateId() { return aggregateId; }
    public UUID getCondominiumId() { return condominiumId; }
    public String getRoutingKey() { return routingKey; }
    public String getPayload() { return payload; }
    public String getDedupKey() { return dedupKey; }
    public OutboxStatus getStatus() { return status; }
    public int getAttempts() { return attempts; }
    public Instant getPublishedAt() { return publishedAt; }
}
