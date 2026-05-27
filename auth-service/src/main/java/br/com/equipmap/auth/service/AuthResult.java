package br.com.equipmap.auth.service;

import br.com.equipmap.auth.api.dto.AuthResponse;

public record AuthResult(
        AuthResponse response,
        String refreshToken
) {
}
