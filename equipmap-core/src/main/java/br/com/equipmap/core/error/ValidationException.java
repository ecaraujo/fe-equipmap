package br.com.equipmap.core.error;

import java.util.List;

public class ValidationException extends ApiException {
    public ValidationException(String message, List<ErrorDetail> details) {
        super(400, "BAD_REQUEST", message, details);
    }
}
