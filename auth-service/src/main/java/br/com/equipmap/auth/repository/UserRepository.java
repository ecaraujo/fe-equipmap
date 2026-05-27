package br.com.equipmap.auth.repository;

import br.com.equipmap.auth.domain.AuthProvider;
import br.com.equipmap.auth.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByProviderAndProviderSubject(AuthProvider provider, String providerSubject);
}
