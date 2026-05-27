package br.com.equipmap.core.error;

import java.util.List;

public class ConflictException extends ApiException {
    public ConflictException(String message) {
        super(409, "CONFLICT", message);
    }

    public ConflictException(String message, List<ErrorDetail> details) {
        super(409, "CONFLICT", message, details);
    }
}
