package br.com.equipmap.auth.service;

import br.com.equipmap.auth.domain.AuditLog;
import br.com.equipmap.auth.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuditService {
    private static final Logger log = LoggerFactory.getLogger(AuditService.class);
    private final AuditLogRepository repository;

    public AuditService(AuditLogRepository repository) {
        this.repository = repository;
    }

    public void crossTenantAttempt(UUID userId, UUID requestedCondominiumId, UUID tokenCondominiumId, String traceId) {
        log.warn("Cross-tenant access attempt userId={} requestedCondominiumId={} tokenCondominiumId={} traceId={}",
                userId, requestedCondominiumId, tokenCondominiumId, traceId);
        repository.save(new AuditLog(userId, "CROSS_TENANT_ACCESS", requestedCondominiumId, tokenCondominiumId, traceId, "Requested condominium differs from JWT claim"));
    }
}
