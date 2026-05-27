package br.com.equipmap.auth.security;

import br.com.equipmap.auth.config.AuthProperties;
import br.com.equipmap.auth.domain.User;
import br.com.equipmap.auth.domain.UserCondominium;
import br.com.equipmap.auth.domain.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {
    private final AuthProperties properties;
    private final SecretKey key;

    public JwtService(AuthProperties properties) {
        this.properties = properties;
        this.key = Keys.hmacShaKeyFor(properties.getJwt().getSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String createAccessToken(User user, UserCondominium condominium) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(properties.getJwt().getAccessTokenMinutes() * 60L);

        return Jwts.builder()
                .issuer(properties.getJwt().getIssuer())
                .subject(user.getId().toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .claim("userId", user.getId().toString())
                .claim("role", condominium.getRole().name())
                .claim("condominiumId", condominium.getCondominiumId().toString())
                .signWith(key)
                .compact();
    }

    public AuthPrincipal parse(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .requireIssuer(properties.getJwt().getIssuer())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return new AuthPrincipal(
                UUID.fromString(claims.get("userId", String.class)),
                UserRole.valueOf(claims.get("role", String.class)),
                UUID.fromString(claims.get("condominiumId", String.class))
        );
    }
}
