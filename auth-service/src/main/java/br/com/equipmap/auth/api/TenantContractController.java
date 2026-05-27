package br.com.equipmap.auth.api;

import br.com.equipmap.auth.security.RequireAuthenticatedRole;
import br.com.equipmap.auth.security.RequireManagerOrAdmin;
import br.com.equipmap.auth.security.SecuritySupport;
import br.com.equipmap.auth.service.TenantAccessGuard;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/auth/contract")
public class TenantContractController {
    private final TenantAccessGuard tenantAccessGuard;

    public TenantContractController(TenantAccessGuard tenantAccessGuard) {
        this.tenantAccessGuard = tenantAccessGuard;
    }

    @GetMapping("/read")
    @RequireAuthenticatedRole
    @Operation(summary = "Protected read endpoint used by BFF contract tests")
    public void read(@RequestHeader("X-Condominium-Id") UUID condominiumId, HttpServletRequest request) {
        tenantAccessGuard.requireSameCondominium(SecuritySupport.principal(), condominiumId, traceId(request));
    }

    @PatchMapping("/write")
    @RequireManagerOrAdmin
    @Operation(summary = "Protected write endpoint used by BFF contract tests")
    public void write(@RequestHeader("X-Condominium-Id") UUID condominiumId, HttpServletRequest request) {
        tenantAccessGuard.requireSameCondominium(SecuritySupport.principal(), condominiumId, traceId(request));
    }

    private String traceId(HttpServletRequest request) {
        String traceId = request.getHeader(br.com.equipmap.core.constants.HttpHeaders.TRACE_ID);
        return traceId == null || traceId.isBlank() ? request.getRequestId() : traceId;
    }
}
