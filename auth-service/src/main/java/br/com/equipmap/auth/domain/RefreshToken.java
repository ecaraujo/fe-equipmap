package br.com.equipmap.auth.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {
    @Id
    private UUID id = UUID.randomUUID();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "token_hash", nullable = false, unique = true, length = 128)
    private String tokenHash;

    @Column(name = "token_family", nullable = false)
    private UUID tokenFamily;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "rotated_to_token_hash", length = 128)
    private String rotatedToTokenHash;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected RefreshToken() {
    }

    public RefreshToken(User user, String tokenHash, UUID tokenFamily, Instant expiresAt) {
        this.user = user;
        this.tokenHash = tokenHash;
        this.tokenFamily = tokenFamily;
        this.expiresAt = expiresAt;
    }

    public User getUser() {
        return user;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public UUID getTokenFamily() {
        return tokenFamily;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Instant getRevokedAt() {
        return revokedAt;
    }

    public String getRotatedToTokenHash() {
        return rotatedToTokenHash;
    }

    public void revoke(Instant revokedAt) {
        this.revokedAt = revokedAt;
    }

    public void rotateTo(String nextTokenHash, Instant revokedAt) {
        this.rotatedToTokenHash = nextTokenHash;
        this.revokedAt = revokedAt;
    }
}
