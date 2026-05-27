package br.com.equipmap.warranty.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record ConfirmUploadRequest(
        @NotBlank String objectKey,
        @NotBlank String fileName,
        @NotBlank String mimeType,
        @NotBlank String detectedMimeType,
        @Min(1) long sizeBytes,
        String checksum
) {
}
