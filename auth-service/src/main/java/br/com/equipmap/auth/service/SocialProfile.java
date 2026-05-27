package br.com.equipmap.auth.service;

public record SocialProfile(
        String subject,
        String email,
        String name
) {
}
