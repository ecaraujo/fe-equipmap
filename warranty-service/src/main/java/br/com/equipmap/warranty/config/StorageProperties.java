package br.com.equipmap.warranty.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "equipmap.storage")
public record StorageProperties(
        String endpoint,
        String publicEndpoint,
        String bucket,
        String accessKey,
        String secretKey,
        int presignedExpirationMinutes
) {
}
