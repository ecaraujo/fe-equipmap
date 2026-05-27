package br.com.equipmap.auth.api;

import br.com.equipmap.auth.api.dto.AuthResponse;
import br.com.equipmap.auth.api.dto.LoginRequest;
import br.com.equipmap.auth.api.dto.SocialLoginRequest;
import br.com.equipmap.auth.api.dto.SwitchCondominiumRequest;
import br.com.equipmap.auth.api.dto.UserResponse;
import br.com.equipmap.auth.config.AuthProperties;
import br.com.equipmap.auth.domain.AuthProvider;
import br.com.equipmap.auth.security.SecuritySupport;
import br.com.equipmap.auth.service.AuthResult;
import br.com.equipmap.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;
    private final AuthProperties properties;

    public AuthController(AuthService authService, AuthProperties properties) {
        this.authService = authService;
        this.properties = properties;
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResult result = authService.login(request);
        setRefreshCookie(response, result.refreshToken(), properties.refreshTokenTtl());
        return result.response();
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate refresh token and issue a new access token")
    public AuthResponse refresh(@CookieValue(name = "${equipmap.auth.cookie.name}", required = false) String refreshToken, HttpServletResponse response) {
        AuthResult result = authService.refresh(refreshToken);
        setRefreshCookie(response, result.refreshToken(), properties.refreshTokenTtl());
        return result.response();
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and revoke current refresh token")
    public void logout(@CookieValue(name = "${equipmap.auth.cookie.name}", required = false) String refreshToken, HttpServletResponse response) {
        authService.logout(refreshToken);
        setRefreshCookie(response, "", Duration.ZERO);
    }

    @GetMapping("/me")
    @Operation(summary = "Return authenticated user profile and condominiums")
    public UserResponse me() {
        return authService.me(SecuritySupport.principal());
    }

    @PostMapping("/switch-condominium")
    @Operation(summary = "Switch active condominium and issue a new token pair")
    public AuthResponse switchCondominium(@Valid @RequestBody SwitchCondominiumRequest request, HttpServletResponse response) {
        AuthResult result = authService.switchCondominium(SecuritySupport.principal(), request.condominiumId());
        setRefreshCookie(response, result.refreshToken(), properties.refreshTokenTtl());
        return result.response();
    }

    @PostMapping("/social/google")
    @Operation(summary = "Login with Google OAuth authorization code")
    public AuthResponse google(@Valid @RequestBody SocialLoginRequest request, HttpServletResponse response) {
        AuthResult result = authService.socialLogin(AuthProvider.GOOGLE, request);
        setRefreshCookie(response, result.refreshToken(), properties.refreshTokenTtl());
        return result.response();
    }

    @PostMapping("/social/microsoft")
    @Operation(summary = "Login with Microsoft OAuth authorization code")
    public AuthResponse microsoft(@Valid @RequestBody SocialLoginRequest request, HttpServletResponse response) {
        AuthResult result = authService.socialLogin(AuthProvider.MICROSOFT, request);
        setRefreshCookie(response, result.refreshToken(), properties.refreshTokenTtl());
        return result.response();
    }

    private void setRefreshCookie(HttpServletResponse response, String value, Duration maxAge) {
        ResponseCookie cookie = ResponseCookie.from(properties.getCookie().getName(), value)
                .httpOnly(true)
                .secure(properties.getCookie().isSecure())
                .sameSite(properties.getCookie().getSameSite())
                .path("/auth")
                .maxAge(maxAge)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
