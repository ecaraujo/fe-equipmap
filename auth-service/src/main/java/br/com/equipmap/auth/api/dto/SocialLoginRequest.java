package br.com.equipmap.auth.api.dto;

import jakarta.validation.constraints.NotBlank;

public record SocialLoginRequest(
        @NotBlank String authorizationCode,
        String redirectUri
) {
}
