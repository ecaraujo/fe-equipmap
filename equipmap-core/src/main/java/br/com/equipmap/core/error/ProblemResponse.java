package br.com.equipmap.core.error;

import java.time.Instant;
import java.util.List;

public record ProblemResponse(
        int statusCode,
        String error,
        String message,
        List<ErrorDetail> details,
        Instant timestamp,
        String traceId
) {
    public static ProblemResponse of(int statusCode, String error, String message, List<ErrorDetail> details, String traceId) {
        return new ProblemResponse(statusCode, error, message, details == null ? List.of() : List.copyOf(details), Instant.now(), traceId);
    }
}
