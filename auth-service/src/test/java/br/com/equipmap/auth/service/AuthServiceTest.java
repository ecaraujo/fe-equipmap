package br.com.equipmap.auth.service;

import br.com.equipmap.auth.api.dto.LoginRequest;
import br.com.equipmap.auth.api.dto.SocialLoginRequest;
import br.com.equipmap.auth.domain.AuthProvider;
import br.com.equipmap.auth.domain.User;
import br.com.equipmap.auth.domain.UserCondominium;
import br.com.equipmap.auth.domain.UserRole;
import br.com.equipmap.auth.repository.RefreshTokenRepository;
import br.com.equipmap.auth.repository.UserRepository;
import br.com.equipmap.auth.security.JwtService;
import br.com.equipmap.core.error.ForbiddenException;
import br.com.equipmap.core.error.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class AuthServiceTest {
    private static final UUID CONDOMINIUM_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    @Autowired
    AuthService authService;

    @Autowired
    JwtService jwtService;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    UserRepository users;

    @Autowired
    RefreshTokenRepository refreshTokens;

    @BeforeEach
    void setUp() {
        refreshTokens.deleteAll();
        users.deleteAll();
        User user = new User("admin@equipmap.local", passwordEncoder.encode("admin123"), "Admin", AuthProvider.LOCAL);
        user.getCondominiums().add(new UserCondominium(
                user,
                CONDOMINIUM_ID,
                "Residencial Park EquipMap",
                "12345678000199",
                "Rua das Acacias, 100",
                "America/Sao_Paulo",
                UserRole.ADMIN
        ));
        users.save(user);
    }

    @Test
    void loginReturnsJwtWithCondominiumClaim() {
        AuthResult result = authService.login(new LoginRequest("admin@equipmap.local", "admin123"));

        assertThat(result.response().token()).isNotBlank();
        assertThat(result.response().requiresCondominiumSelection()).isFalse();
        assertThat(jwtService.parse(result.response().token()).condominiumId()).isEqualTo(CONDOMINIUM_ID);
    }

    @Test
    void refreshRotatesTokenAndRejectsReuse() {
        AuthResult result = authService.login(new LoginRequest("admin@equipmap.local", "admin123"));

        AuthResult refreshed = authService.refresh(result.refreshToken());

        assertThat(refreshed.refreshToken()).isNotEqualTo(result.refreshToken());
        assertThatThrownBy(() -> authService.refresh(result.refreshToken()))
                .hasMessageContaining("reuse");
    }

    @Test
    void switchCondominiumRejectsUnknownMembership() {
        AuthResult result = authService.login(new LoginRequest("admin@equipmap.local", "admin123"));
        var principal = jwtService.parse(result.response().token());

        assertThatThrownBy(() -> authService.switchCondominium(principal, UUID.fromString("22222222-2222-2222-2222-222222222222")))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void socialLoginFailsControlledWhenProviderIsNotConfigured() {
        assertThatThrownBy(() -> authService.socialLogin(AuthProvider.GOOGLE, new SocialLoginRequest("code", "http://localhost/callback")))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("not configured");
    }
}
