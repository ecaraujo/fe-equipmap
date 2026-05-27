package br.com.equipmap.core.error;

public class NotFoundException extends ApiException {
    public NotFoundException(String message) {
        super(404, "NOT_FOUND", message);
    }
}
