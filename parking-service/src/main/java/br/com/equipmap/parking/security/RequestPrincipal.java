package br.com.equipmap.parking.security;

import br.com.equipmap.parking.domain.UserRole;

import java.util.UUID;

public record RequestPrincipal(UUID userId, UserRole role, UUID condominiumId) {
    public boolean canWrite() {
        return role == UserRole.ADMIN || role == UserRole.MANAGER;
    }

    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }
}
