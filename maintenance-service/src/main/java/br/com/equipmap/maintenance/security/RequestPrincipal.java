package br.com.equipmap.maintenance.security;

import br.com.equipmap.maintenance.domain.UserRole;

import java.util.UUID;

public record RequestPrincipal(UUID userId, UserRole role, UUID condominiumId) {
    public boolean canWrite() {
        return role == UserRole.ADMIN || role == UserRole.MANAGER;
    }
}
