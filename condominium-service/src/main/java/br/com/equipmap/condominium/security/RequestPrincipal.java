package br.com.equipmap.condominium.security;

import br.com.equipmap.condominium.domain.UserRole;

import java.util.UUID;

public record RequestPrincipal(
        UUID userId,
        UserRole role,
        UUID condominiumId
) {
    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }

    public boolean canManageAssociations() {
        return role == UserRole.ADMIN || role == UserRole.MANAGER;
    }
}
