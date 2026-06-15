package br.com.equipmap.brigadier.api.dto;

import br.com.equipmap.brigadier.domain.Brigadier;
import br.com.equipmap.brigadier.domain.BrigadierRole;
import br.com.equipmap.brigadier.domain.CertificationStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record BrigadierResponse(
        UUID id,
        UUID condominiumId,
        String name,
        String apartment,
        String block,
        BrigadierRole role,
        String phone,
        String email,
        boolean active,
        LocalDate certificationDate,
        LocalDate certificationExpiry,
        CertificationStatus certificationStatus,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
    public static BrigadierResponse from(Brigadier brigadier, LocalDate today, int expiringWindowDays) {
        return new BrigadierResponse(brigadier.getId(), brigadier.getCondominiumId(), brigadier.getName(),
                brigadier.getApartment(), brigadier.getBlock(), brigadier.getRole(), brigadier.getPhone(), brigadier.getEmail(), brigadier.isActive(), brigadier.getCertificationDate(),
                brigadier.getCertificationExpiry(), brigadier.certificationStatus(today, expiringWindowDays),
                brigadier.getNotes(), brigadier.getCreatedAt(), brigadier.getUpdatedAt());
    }
}
