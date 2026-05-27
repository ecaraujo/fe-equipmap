package br.com.equipmap.auth.api.dto;

import br.com.equipmap.auth.domain.UserCondominium;
import br.com.equipmap.auth.domain.UserRole;

import java.util.UUID;

public record CondominiumResponse(
        UUID id,
        String name,
        String cnpj,
        String address,
        String timezone,
        UserRole role,
        boolean active
) {
    public static CondominiumResponse from(UserCondominium item) {
        return new CondominiumResponse(
                item.getCondominiumId(),
                item.getCondominiumName(),
                item.getCondominiumCnpj(),
                item.getCondominiumAddress(),
                item.getCondominiumTimezone(),
                item.getRole(),
                item.isActive()
        );
    }
}
