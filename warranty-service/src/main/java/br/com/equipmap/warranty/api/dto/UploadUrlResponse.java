package br.com.equipmap.warranty.api.dto;

import java.net.URI;
import java.time.Instant;
import java.util.Set;

public record UploadUrlResponse(
        String objectKey,
        URI uploadUrl,
        URI documentUrl,
        Instant expiresAt,
        long maxBytes,
        Set<String> acceptedMimeTypes
) {
}
