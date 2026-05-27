package br.com.equipmap.auth.service;

import br.com.equipmap.auth.domain.RefreshToken;

public record RefreshTokenBundle(
        String rawToken,
        RefreshToken entity
) {
}
