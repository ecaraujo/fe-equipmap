package br.com.equipmap.condominium.api.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateCondominiumRequest(
        @NotBlank String name,
        @NotBlank String cnpj,
        @NotBlank String address,
        String timezone,
        Boolean active
) {
}
