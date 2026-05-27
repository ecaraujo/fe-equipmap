package br.com.equipmap.core.storage;

import java.net.URI;
import java.time.Instant;
import java.util.Set;

public record PresignedUploadUrl(
        URI uploadUrl,
        URI documentUrl,
        Instant expiresAt,
        long maxBytes,
        Set<String> acceptedMimeTypes
) {
}
