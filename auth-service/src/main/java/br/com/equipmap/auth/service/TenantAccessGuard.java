package br.com.equipmap.auth.service;

import br.com.equipmap.auth.security.AuthPrincipal;
import br.com.equipmap.core.error.ForbiddenException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class TenantAccessGuard {
    private final AuditService auditService;

    public TenantAccessGuard(AuditService auditService) {
        this.auditService = auditService;
    }

    public void requireSameCondominium(AuthPrincipal principal, UUID requestedCondominiumId, String traceId) {
        if (requestedCondominiumId != null && !requestedCondominiumId.equals(principal.condominiumId())) {
            auditService.crossTenantAttempt(principal.userId(), requestedCondominiumId, principal.condominiumId(), traceId);
            throw new ForbiddenException("Cross-tenant access denied");
        }
    }
}
