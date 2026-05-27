package br.com.equipmap.core.error;

public class ForbiddenException extends ApiException {
    public ForbiddenException(String message) {
        super(403, "FORBIDDEN", message);
    }
}
