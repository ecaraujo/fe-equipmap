package br.com.equipmap.auth.api.dto;

public record AuthResponse(
        String token,
        boolean requiresCondominiumSelection,
        UserResponse user
) {
}
