package br.com.equipmap.warranty.service;

import br.com.equipmap.core.storage.PresignedUploadUrl;
import br.com.equipmap.core.storage.StorageService;
import br.com.equipmap.core.storage.StorageUploadRequest;
import br.com.equipmap.core.storage.StoredObjectMetadata;
import br.com.equipmap.warranty.config.StorageProperties;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MinioStorageService implements StorageService {
    private final StorageProperties properties;
    private final Map<String, StoredObjectMetadata> metadataByKey = new ConcurrentHashMap<>();

    public MinioStorageService(StorageProperties properties) {
        this.properties = properties;
    }

    @Override
    public PresignedUploadUrl generatePresignedUrl(StorageUploadRequest request) {
        Instant expiresAt = Instant.now().plus(request.expiresIn());
        URI uploadUrl = UriComponentsBuilder.fromUriString(properties.publicEndpoint())
                .pathSegment(request.bucket(), request.objectKey())
                .queryParam("X-Amz-Algorithm", "AWS4-HMAC-SHA256")
                .queryParam("X-Amz-Credential", properties.accessKey())
                .queryParam("X-Amz-Expires", request.expiresIn().toSeconds())
                .queryParam("X-Amz-SignedHeaders", "content-type")
                .build()
                .toUri();
        URI documentUrl = UriComponentsBuilder.fromUriString(properties.publicEndpoint())
                .pathSegment(request.bucket(), request.objectKey())
                .build()
                .toUri();
        metadataByKey.put(request.objectKey(), new StoredObjectMetadata(request.objectKey(), request.contentType(), request.sizeBytes(), "", expiresAt));
        return new PresignedUploadUrl(uploadUrl, documentUrl, expiresAt, request.maxBytes(), request.acceptedMimeTypes());
    }

    @Override
    public boolean validateMimeType(String objectKey, String expectedMimeType) {
        StoredObjectMetadata metadata = metadataByKey.get(objectKey);
        return metadata != null && metadata.contentType().equalsIgnoreCase(expectedMimeType);
    }

    @Override
    public StoredObjectMetadata getObjectMetadata(String objectKey) {
        return metadataByKey.get(objectKey);
    }

    public void recordConfirmedMetadata(String objectKey, String detectedMimeType, long sizeBytes, String checksum) {
        metadataByKey.put(objectKey, new StoredObjectMetadata(objectKey, detectedMimeType, sizeBytes, checksum, Instant.now()));
    }
}
