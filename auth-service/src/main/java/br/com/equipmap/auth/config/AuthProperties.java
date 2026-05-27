package br.com.equipmap.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;
import java.util.UUID;

@ConfigurationProperties(prefix = "equipmap.auth")
public class AuthProperties {
    private final Jwt jwt = new Jwt();
    private final Cookie cookie = new Cookie();
    private final Seed seed = new Seed();
    private final OAuth oauth = new OAuth();
    private int refreshTokenDays = 7;

    public Jwt getJwt() {
        return jwt;
    }

    public Cookie getCookie() {
        return cookie;
    }

    public Seed getSeed() {
        return seed;
    }

    public OAuth getOauth() {
        return oauth;
    }

    public int getRefreshTokenDays() {
        return refreshTokenDays;
    }

    public void setRefreshTokenDays(int refreshTokenDays) {
        this.refreshTokenDays = refreshTokenDays;
    }

    public Duration refreshTokenTtl() {
        return Duration.ofDays(refreshTokenDays);
    }

    public static class Jwt {
        private String issuer = "equipmap-auth-service";
        private String secret = "dev-only-change-me-dev-only-change-me-dev-only-change-me";
        private int accessTokenMinutes = 15;

        public String getIssuer() {
            return issuer;
        }

        public void setIssuer(String issuer) {
            this.issuer = issuer;
        }

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public int getAccessTokenMinutes() {
            return accessTokenMinutes;
        }

        public void setAccessTokenMinutes(int accessTokenMinutes) {
            this.accessTokenMinutes = accessTokenMinutes;
        }
    }

    public static class Cookie {
        private String name = "equipmap_refresh_token";
        private boolean secure;
        private String sameSite = "Strict";

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public boolean isSecure() {
            return secure;
        }

        public void setSecure(boolean secure) {
            this.secure = secure;
        }

        public String getSameSite() {
            return sameSite;
        }

        public void setSameSite(String sameSite) {
            this.sameSite = sameSite;
        }
    }

    public static class Seed {
        private String adminEmail = "admin@equipmap.local";
        private String adminPassword = "admin123";
        private UUID condominiumId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        private String condominiumName = "Residencial Park EquipMap";
        private String condominiumCnpj = "12345678000199";
        private String condominiumAddress = "Rua das Acacias, 100";
        private String condominiumTimezone = "America/Sao_Paulo";

        public String getAdminEmail() {
            return adminEmail;
        }

        public void setAdminEmail(String adminEmail) {
            this.adminEmail = adminEmail;
        }

        public String getAdminPassword() {
            return adminPassword;
        }

        public void setAdminPassword(String adminPassword) {
            this.adminPassword = adminPassword;
        }

        public UUID getCondominiumId() {
            return condominiumId;
        }

        public void setCondominiumId(UUID condominiumId) {
            this.condominiumId = condominiumId;
        }

        public String getCondominiumName() {
            return condominiumName;
        }

        public void setCondominiumName(String condominiumName) {
            this.condominiumName = condominiumName;
        }

        public String getCondominiumCnpj() {
            return condominiumCnpj;
        }

        public void setCondominiumCnpj(String condominiumCnpj) {
            this.condominiumCnpj = condominiumCnpj;
        }

        public String getCondominiumAddress() {
            return condominiumAddress;
        }

        public void setCondominiumAddress(String condominiumAddress) {
            this.condominiumAddress = condominiumAddress;
        }

        public String getCondominiumTimezone() {
            return condominiumTimezone;
        }

        public void setCondominiumTimezone(String condominiumTimezone) {
            this.condominiumTimezone = condominiumTimezone;
        }
    }

    public static class OAuth {
        private final Provider google = new Provider(
                "",
                "",
                "https://oauth2.googleapis.com/token",
                "https://www.googleapis.com/oauth2/v3/userinfo"
        );
        private final Provider microsoft = new Provider(
                "",
                "",
                "https://login.microsoftonline.com/common/oauth2/v2.0/token",
                "https://graph.microsoft.com/oidc/userinfo"
        );

        public Provider getGoogle() {
            return google;
        }

        public Provider getMicrosoft() {
            return microsoft;
        }
    }

    public static class Provider {
        private String clientId;
        private String clientSecret;
        private String tokenUri;
        private String userInfoUri;

        public Provider(String clientId, String clientSecret, String tokenUri, String userInfoUri) {
            this.clientId = clientId;
            this.clientSecret = clientSecret;
            this.tokenUri = tokenUri;
            this.userInfoUri = userInfoUri;
        }

        public String getClientId() {
            return clientId;
        }

        public void setClientId(String clientId) {
            this.clientId = clientId;
        }

        public String getClientSecret() {
            return clientSecret;
        }

        public void setClientSecret(String clientSecret) {
            this.clientSecret = clientSecret;
        }

        public String getTokenUri() {
            return tokenUri;
        }

        public void setTokenUri(String tokenUri) {
            this.tokenUri = tokenUri;
        }

        public String getUserInfoUri() {
            return userInfoUri;
        }

        public void setUserInfoUri(String userInfoUri) {
            this.userInfoUri = userInfoUri;
        }
    }
}
