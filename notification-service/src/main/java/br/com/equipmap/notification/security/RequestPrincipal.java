package br.com.equipmap.notification.security;

import br.com.equipmap.notification.domain.UserRole;

import java.util.UUID;

public record RequestPrincipal(UUID userId, UserRole role, UUID condominiumId) {
}
