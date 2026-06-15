package br.com.equipmap.brigadier.api.dto;

import br.com.equipmap.brigadier.domain.BrigadierRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateBrigadierRequest(
        @NotBlank String name,
        @NotBlank String apartment,
        @NotBlank String block,
        @NotNull BrigadierRole role,
        @NotBlank String phone,
        String email,
        boolean active,
        @NotNull LocalDate certificationDate,
        @NotNull LocalDate certificationExpiry,
        String notes
) {
}
