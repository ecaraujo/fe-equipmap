package br.com.equipmap.condominium.api.dto;

import br.com.equipmap.condominium.domain.CondominiumUser;
import br.com.equipmap.condominium.domain.UserRole;

import java.util.UUID;

public record CondominiumUserResponse(
        UUID id,
        UUID condominiumId,
        UUID userId,
        String userEmail,
        String userName,
        UserRole role,
        boolean active
) {
    public static CondominiumUserResponse from(CondominiumUser user) {
        return new CondominiumUserResponse(
                user.getId(),
                user.getCondominium().getId(),
                user.getUserId(),
                user.getUserEmail(),
                user.getUserName(),
                user.getRole(),
                user.isActive()
        );
    }
}
