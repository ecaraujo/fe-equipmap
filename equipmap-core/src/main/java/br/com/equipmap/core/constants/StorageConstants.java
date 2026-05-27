package br.com.equipmap.core.constants;

import java.util.Set;

public final class StorageConstants {
    public static final long WARRANTY_DOCUMENT_MAX_BYTES = 10L * 1024L * 1024L;
    public static final Set<String> WARRANTY_DOCUMENT_ACCEPTED_MIME_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png"
    );

    private StorageConstants() {
    }
}
