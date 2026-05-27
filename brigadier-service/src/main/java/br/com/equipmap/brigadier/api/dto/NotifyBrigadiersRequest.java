package br.com.equipmap.brigadier.api.dto;

import br.com.equipmap.core.messaging.MessageChannel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record NotifyBrigadiersRequest(
        @NotBlank String message,
        @NotEmpty List<UUID> brigadierIds,
        @NotNull MessageChannel channel
) {
}
