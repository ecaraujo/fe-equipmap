package br.com.equipmap.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

@Configuration
public class PasswordConfig {
    @Bean
    PasswordEncoder passwordEncoder() {
        var bcrypt = new BCryptPasswordEncoder(12);
        var encoder = new DelegatingPasswordEncoder("bcrypt", Map.of("bcrypt", bcrypt));
        encoder.setDefaultPasswordEncoderForMatches(bcrypt);
        return encoder;
    }
}
