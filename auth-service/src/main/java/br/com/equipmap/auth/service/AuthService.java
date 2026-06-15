package br.com.equipmap.auth.service;

import br.com.equipmap.auth.api.dto.AuthResponse;
import br.com.equipmap.auth.api.dto.LoginRequest;
import br.com.equipmap.auth.api.dto.SocialLoginRequest;
import br.com.equipmap.auth.api.dto.UserResponse;
import br.com.equipmap.auth.domain.AuthProvider;
import br.com.equipmap.auth.domain.User;
import br.com.equipmap.auth.domain.UserCondominium;
import br.com.equipmap.auth.repository.UserRepository;
import br.com.equipmap.auth.security.AuthPrincipal;
import br.com.equipmap.auth.security.JwtService;
import br.com.equipmap.core.error.ForbiddenException;
import br.com.equipmap.core.error.UnauthorizedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final OAuthClient oAuthClient;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService, RefreshTokenService refreshTokenService, OAuthClient oAuthClient) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.oAuthClient = oAuthClient;
    }

    @Transactional
    public AuthResult login(LoginRequest request) {
        User user = users.findByEmailIgnoreCase(request.email())
                .filter(User::isActive)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        UserCondominium selected = autoSelectCondominium(user);
        return authenticated(user, selected);
    }

    @Transactional
    public AuthResult refresh(String refreshToken) {
        RefreshTokenBundle rotated = refreshTokenService.rotate(refreshToken);
        User user = rotated.entity().getUser();
        UserCondominium selected = autoSelectCondominium(user);
        return new AuthResult(authResponse(user, selected), rotated.rawToken());
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenService.revoke(refreshToken);
    }

    @Transactional(readOnly = true)
    public UserResponse me(AuthPrincipal principal) {
        User user = users.findById(principal.userId()).orElseThrow(() -> new UnauthorizedException("User not found"));
        UserCondominium active = findMembership(user, principal.condominiumId());
        return UserResponse.from(user, active);
    }

    @Transactional
    public AuthResult switchCondominium(AuthPrincipal principal, UUID condominiumId) {
        User user = users.findById(principal.userId()).orElseThrow(() -> new UnauthorizedException("User not found"));
        UserCondominium selected = findMembership(user, condominiumId);
        return authenticated(user, selected);
    }

    @Transactional
    public AuthResult socialLogin(AuthProvider provider, SocialLoginRequest request) {
        SocialProfile profile = oAuthClient.exchange(provider, request);
        User user = users.findByProviderAndProviderSubject(provider, profile.subject())
                .or(() -> users.findByEmailIgnoreCase(profile.email()).map(existing -> {
                    existing.setProvider(provider);
                    existing.setProviderSubject(profile.subject());
                    return existing;
                }))
                .orElseGet(() -> users.save(newSocialUser(provider, profile)));

        UserCondominium selected = autoSelectCondominium(user);
        return authenticated(user, selected);
    }

    private User newSocialUser(AuthProvider provider, SocialProfile profile) {
        User user = new User(profile.email(), null, profile.name(), provider);
        user.setProviderSubject(profile.subject());
        return user;
    }

    private AuthResult authenticated(User user, UserCondominium selected) {
        RefreshTokenBundle refresh = refreshTokenService.issue(user);
        return new AuthResult(authResponse(user, selected), refresh.rawToken());
    }

    private AuthResponse authResponse(User user, UserCondominium selected) {
        boolean requiresSelection = selected == null;
        String accessToken = selected == null ? null : jwtService.createAccessToken(user, selected);
        return new AuthResponse(accessToken, requiresSelection, UserResponse.from(user, selected));
    }

    private UserCondominium autoSelectCondominium(User user) {
        List<UserCondominium> active = user.getCondominiums().stream().filter(UserCondominium::isActive).toList();
        return active.size() == 1 ? active.getFirst() : null;
    }

    private UserCondominium findMembership(User user, UUID condominiumId) {
        return user.getCondominiums().stream()
                .filter(UserCondominium::isActive)
                .filter(item -> item.getCondominiumId().equals(condominiumId))
                .findFirst()
                .orElseThrow(() -> new ForbiddenException("User does not belong to requested condominium"));
    }
}
