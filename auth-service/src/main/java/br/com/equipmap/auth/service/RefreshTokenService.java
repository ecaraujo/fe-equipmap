package br.com.equipmap.auth.service;

import br.com.equipmap.auth.config.AuthProperties;
import br.com.equipmap.auth.domain.RefreshToken;
import br.com.equipmap.auth.domain.User;
import br.com.equipmap.auth.repository.RefreshTokenRepository;
import br.com.equipmap.core.error.UnauthorizedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class RefreshTokenService {
    private final RefreshTokenRepository repository;
    private final AuthProperties properties;
    private final SecureRandom random = new SecureRandom();

    public RefreshTokenService(RefreshTokenRepository repository, AuthProperties properties) {
        this.repository = repository;
        this.properties = properties;
    }

    @Transactional
    public RefreshTokenBundle issue(User user) {
        return issue(user, UUID.randomUUID());
    }

    @Transactional
    public RefreshTokenBundle rotate(String rawToken) {
        RefreshToken current = repository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (current.getRevokedAt() != null || current.getRotatedToTokenHash() != null) {
            revokeFamily(current.getTokenFamily());
            throw new UnauthorizedException("Refresh token reuse detected");
        }

        if (current.getExpiresAt().isBefore(Instant.now())) {
            current.revoke(Instant.now());
            throw new UnauthorizedException("Refresh token expired");
        }

        RefreshTokenBundle next = issue(current.getUser(), current.getTokenFamily());
        current.rotateTo(next.entity().getTokenHash(), Instant.now());
        return next;
    }

    @Transactional
    public void revoke(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        repository.findByTokenHash(hash(rawToken)).ifPresent(token -> token.revoke(Instant.now()));
    }

    @Transactional
    public void revokeAllForUser(UUID userId) {
        repository.deleteByUser_Id(userId);
    }

    private RefreshTokenBundle issue(User user, UUID family) {
        String raw = randomToken();
        RefreshToken token = new RefreshToken(user, hash(raw), family, Instant.now().plus(properties.refreshTokenTtl()));
        return new RefreshTokenBundle(raw, repository.save(token));
    }

    private void revokeFamily(UUID family) {
        Instant now = Instant.now();
        repository.findAllByTokenFamily(family).forEach(token -> token.revoke(now));
    }

    public static String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is unavailable", e);
        }
    }

    private String randomToken() {
        byte[] bytes = new byte[48];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
