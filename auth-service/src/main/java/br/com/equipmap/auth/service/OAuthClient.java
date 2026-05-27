package br.com.equipmap.auth.service;

import br.com.equipmap.auth.api.dto.SocialLoginRequest;
import br.com.equipmap.auth.config.AuthProperties;
import br.com.equipmap.auth.domain.AuthProvider;
import br.com.equipmap.core.error.ApiException;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
public class OAuthClient {
    private final AuthProperties properties;
    private final RestClient restClient;

    public OAuthClient(AuthProperties properties, RestClient.Builder restClientBuilder) {
        this.properties = properties;
        this.restClient = restClientBuilder.build();
    }

    public SocialProfile exchange(AuthProvider provider, SocialLoginRequest request) {
        AuthProperties.Provider config = provider == AuthProvider.GOOGLE
                ? properties.getOauth().getGoogle()
                : properties.getOauth().getMicrosoft();

        if (isBlank(config.getClientId()) || isBlank(config.getClientSecret())) {
            throw new ApiException(501, "OAUTH_PROVIDER_NOT_CONFIGURED", "OAuth provider integration is not configured for " + provider.name());
        }

        try {
            String accessToken = fetchAccessToken(config, request);
            Map<String, Object> userInfo = fetchUserInfo(config, accessToken);
            return toProfile(provider, userInfo);
        } catch (ApiException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw new ApiException(502, "OAUTH_PROVIDER_FAILURE", "OAuth provider request failed");
        }
    }

    @SuppressWarnings("unchecked")
    private String fetchAccessToken(AuthProperties.Provider config, SocialLoginRequest request) {
        var form = new LinkedMultiValueMap<String, String>();
        form.add("grant_type", "authorization_code");
        form.add("code", request.authorizationCode());
        form.add("client_id", config.getClientId());
        form.add("client_secret", config.getClientSecret());
        if (!isBlank(request.redirectUri())) {
            form.add("redirect_uri", request.redirectUri());
        }

        Map<String, Object> tokenResponse = restClient.post()
                .uri(config.getTokenUri())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(Map.class);

        Object accessToken = tokenResponse == null ? null : tokenResponse.get("access_token");
        if (!(accessToken instanceof String token) || token.isBlank()) {
            throw new ApiException(502, "OAUTH_PROVIDER_FAILURE", "OAuth provider did not return an access token");
        }
        return token;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchUserInfo(AuthProperties.Provider config, String accessToken) {
        return restClient.get()
                .uri(config.getUserInfoUri())
                .headers(headers -> headers.setBearerAuth(accessToken))
                .retrieve()
                .body(Map.class);
    }

    private SocialProfile toProfile(AuthProvider provider, Map<String, Object> userInfo) {
        if (userInfo == null) {
            throw new ApiException(502, "OAUTH_PROVIDER_FAILURE", "OAuth provider did not return user info");
        }

        String subject = string(userInfo.get(provider == AuthProvider.MICROSOFT ? "sub" : "sub"));
        if (isBlank(subject) && provider == AuthProvider.MICROSOFT) {
            subject = string(userInfo.get("id"));
        }
        String email = string(userInfo.get("email"));
        if (isBlank(email) && provider == AuthProvider.MICROSOFT) {
            email = string(userInfo.get("userPrincipalName"));
        }
        String name = string(userInfo.get("name"));
        if (isBlank(name) && provider == AuthProvider.MICROSOFT) {
            name = string(userInfo.get("displayName"));
        }

        if (isBlank(subject) || isBlank(email)) {
            throw new ApiException(502, "OAUTH_PROVIDER_FAILURE", "OAuth provider user info is incomplete");
        }

        return new SocialProfile(subject, email, isBlank(name) ? email : name);
    }

    private String string(Object value) {
        return value instanceof String text ? text : null;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
