package br.com.equipmap.condominium.api.dto;

import br.com.equipmap.condominium.domain.Condominium;

import java.util.UUID;

public record CondominiumResponse(
        UUID id,
        String name,
        String cnpj,
        String address,
        String timezone,
        boolean active
) {
    public static CondominiumResponse from(Condominium condominium) {
        return new CondominiumResponse(
                condominium.getId(),
                condominium.getName(),
                condominium.getCnpj(),
                condominium.getAddress(),
                condominium.getTimezone(),
                condominium.isActive()
        );
    }
}
