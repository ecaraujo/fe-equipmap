package br.com.equipmap.condominium.api.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCondominiumRequest(
        @NotBlank String name,
        @NotBlank String cnpj,
        @NotBlank String address,
        String timezone
) {
}
