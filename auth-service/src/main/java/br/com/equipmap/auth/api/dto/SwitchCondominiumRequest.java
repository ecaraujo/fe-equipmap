package br.com.equipmap.auth.api.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SwitchCondominiumRequest(
        @NotNull UUID condominiumId
) {
}
