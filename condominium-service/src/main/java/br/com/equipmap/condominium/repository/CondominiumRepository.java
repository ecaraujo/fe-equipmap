package br.com.equipmap.condominium.repository;

import br.com.equipmap.condominium.domain.Condominium;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CondominiumRepository extends JpaRepository<Condominium, UUID> {
    boolean existsByCnpj(String cnpj);

    boolean existsByCnpjAndIdNot(String cnpj, UUID id);

    Optional<Condominium> findByCnpj(String cnpj);
}
