package br.com.equipmap.core.error;

public class UnauthorizedException extends ApiException {
    public UnauthorizedException(String message) {
        super(401, "UNAUTHORIZED", message);
    }
}
