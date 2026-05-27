package br.com.equipmap.warranty.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record UploadUrlRequest(
        @NotBlank String fileName,
        @NotBlank String mimeType,
        @Min(1) long sizeBytes
) {
}
