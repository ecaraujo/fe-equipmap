package br.com.equipmap.auth.service;

import br.com.equipmap.auth.config.AuthProperties;
import br.com.equipmap.auth.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class SeedAdminService implements ApplicationRunner {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final AuthProperties properties;

    public SeedAdminService(UserRepository users, PasswordEncoder passwordEncoder, AuthProperties properties) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        users.findByEmailIgnoreCase(properties.getSeed().getAdminEmail())
                .ifPresent(user -> user.setPasswordHash(passwordEncoder.encode(properties.getSeed().getAdminPassword())));
    }
}
