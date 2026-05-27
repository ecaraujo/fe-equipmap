package br.com.equipmap.auth.security;

import br.com.equipmap.auth.domain.UserRole;

import java.util.UUID;

public record AuthPrincipal(
        UUID userId,
        UserRole role,
        UUID condominiumId
) {
}
