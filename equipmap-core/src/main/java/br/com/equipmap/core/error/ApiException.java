package br.com.equipmap.core.error;

import java.util.List;

public class ApiException extends RuntimeException {
    private final int statusCode;
    private final String error;
    private final List<ErrorDetail> details;

    public ApiException(int statusCode, String error, String message) {
        this(statusCode, error, message, List.of());
    }

    public ApiException(int statusCode, String error, String message, List<ErrorDetail> details) {
        super(message);
        this.statusCode = statusCode;
        this.error = error;
        this.details = List.copyOf(details);
    }

    public int statusCode() {
        return statusCode;
    }

    public String error() {
        return error;
    }

    public List<ErrorDetail> details() {
        return details;
    }

    public ProblemResponse toProblemResponse(String traceId) {
        return ProblemResponse.of(statusCode, error, getMessage(), details, traceId);
    }
}
