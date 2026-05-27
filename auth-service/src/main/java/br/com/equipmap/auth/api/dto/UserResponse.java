package br.com.equipmap.auth.api.dto;

import br.com.equipmap.auth.domain.User;
import br.com.equipmap.auth.domain.UserCondominium;
import br.com.equipmap.auth.domain.UserRole;

import java.util.List;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String email,
        UserRole role,
        UUID condominiumId,
        String condominiumName,
        List<CondominiumResponse> condominiums
) {
    public static UserResponse from(User user, UserCondominium activeCondominium) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                activeCondominium == null ? null : activeCondominium.getRole(),
                activeCondominium == null ? null : activeCondominium.getCondominiumId(),
                activeCondominium == null ? null : activeCondominium.getCondominiumName(),
                user.getCondominiums().stream().filter(UserCondominium::isActive).map(CondominiumResponse::from).toList()
        );
    }
}
