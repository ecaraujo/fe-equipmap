package br.com.equipmap.core.storage;

import java.time.Instant;

public record StoredObjectMetadata(
        String objectKey,
        String contentType,
        long sizeBytes,
        String checksum,
        Instant lastModified
) {
}
