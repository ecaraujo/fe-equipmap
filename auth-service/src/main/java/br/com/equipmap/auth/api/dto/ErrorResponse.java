package br.com.equipmap.auth.api.dto;

import br.com.equipmap.core.error.ProblemResponse;

public record ErrorResponse(
        ProblemResponse error
) {
}
