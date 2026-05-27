package br.com.equipmap.core.storage;

import java.time.Duration;
import java.util.Set;

public record StorageUploadRequest(
        String bucket,
        String objectKey,
        String fileName,
        String contentType,
        long sizeBytes,
        long maxBytes,
        Set<String> acceptedMimeTypes,
        Duration expiresIn
) {
}
