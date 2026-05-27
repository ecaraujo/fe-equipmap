package br.com.equipmap.warranty.security;

import br.com.equipmap.core.error.UnauthorizedException;
import br.com.equipmap.warranty.domain.UserRole;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class PrincipalResolver {
    public RequestPrincipal resolve(HttpServletRequest request) {
        try {
            String userId = request.getHeader(br.com.equipmap.core.constants.HttpHeaders.USER_ID);
            String role = request.getHeader(br.com.equipmap.core.constants.HttpHeaders.USER_ROLE);
            String condominiumId = request.getHeader(br.com.equipmap.core.constants.HttpHeaders.CONDOMINIUM_ID);
            if (userId == null || role == null || condominiumId == null) throw new IllegalArgumentException("Missing auth headers");
            return new RequestPrincipal(UUID.fromString(userId), UserRole.valueOf(role.toUpperCase()), UUID.fromString(condominiumId));
        } catch (RuntimeException exception) {
            throw new UnauthorizedException("Missing or invalid authentication headers");
        }
    }
}
