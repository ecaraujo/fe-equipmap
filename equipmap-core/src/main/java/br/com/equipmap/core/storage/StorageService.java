package br.com.equipmap.core.storage;

public interface StorageService {
    PresignedUploadUrl generatePresignedUrl(StorageUploadRequest request);

    boolean validateMimeType(String objectKey, String expectedMimeType);

    StoredObjectMetadata getObjectMetadata(String objectKey);
}
