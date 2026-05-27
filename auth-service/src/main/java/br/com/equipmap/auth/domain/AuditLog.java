package br.com.equipmap.auth.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    private UUID id = UUID.randomUUID();

    @Column(name = "user_id")
    private UUID userId;

    @Column(nullable = false, length = 80)
    private String action;

    @Column(name = "requested_condominium_id")
    private UUID requestedCondominiumId;

    @Column(name = "token_condominium_id")
    private UUID tokenCondominiumId;

    @Column(name = "trace_id", length = 80)
    private String traceId;

    @Column(length = 500)
    private String details;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected AuditLog() {
    }

    public AuditLog(UUID userId, String action, UUID requestedCondominiumId, UUID tokenCondominiumId, String traceId, String details) {
        this.userId = userId;
        this.action = action;
        this.requestedCondominiumId = requestedCondominiumId;
        this.tokenCondominiumId = tokenCondominiumId;
        this.traceId = traceId;
        this.details = details;
    }
}
