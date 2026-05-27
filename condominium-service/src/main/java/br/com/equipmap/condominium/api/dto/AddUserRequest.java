package br.com.equipmap.condominium.api.dto;

import br.com.equipmap.condominium.domain.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AddUserRequest(
        @NotNull UUID userId,
        @Email String userEmail,
        String userName,
        @NotNull UserRole role
) {
}
