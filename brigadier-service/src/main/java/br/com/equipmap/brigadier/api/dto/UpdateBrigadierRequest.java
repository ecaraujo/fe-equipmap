package br.com.equipmap.brigadier.api.dto;

import br.com.equipmap.brigadier.domain.BrigadierRole;

import java.time.LocalDate;

public record UpdateBrigadierRequest(
        String name,
        BrigadierRole role,
        String phone,
        String email,
        Boolean active,
        LocalDate certificationDate,
        LocalDate certificationExpiry,
        String notes
) {
}
