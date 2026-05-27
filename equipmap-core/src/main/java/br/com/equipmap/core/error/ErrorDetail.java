package br.com.equipmap.core.error;

public record ErrorDetail(
        String field,
        String issue
) {
}
