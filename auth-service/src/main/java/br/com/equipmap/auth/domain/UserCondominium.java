package br.com.equipmap.auth.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_condominiums")
public class UserCondominium {
    @Id
    private UUID id = UUID.randomUUID();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "condominium_id", nullable = false)
    private UUID condominiumId;

    @Column(name = "condominium_name", nullable = false, length = 160)
    private String condominiumName;

    @Column(name = "condominium_cnpj", nullable = false, length = 20)
    private String condominiumCnpj;

    @Column(name = "condominium_address", nullable = false)
    private String condominiumAddress;

    @Column(name = "condominium_timezone", nullable = false, length = 80)
    private String condominiumTimezone = "America/Sao_Paulo";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private UserRole role;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected UserCondominium() {
    }

    public UserCondominium(User user, UUID condominiumId, String condominiumName, String condominiumCnpj, String condominiumAddress, String condominiumTimezone, UserRole role) {
        this.user = user;
        this.condominiumId = condominiumId;
        this.condominiumName = condominiumName;
        this.condominiumCnpj = condominiumCnpj;
        this.condominiumAddress = condominiumAddress;
        this.condominiumTimezone = condominiumTimezone;
        this.role = role;
    }

    public UUID getCondominiumId() {
        return condominiumId;
    }

    public String getCondominiumName() {
        return condominiumName;
    }

    public String getCondominiumCnpj() {
        return condominiumCnpj;
    }

    public String getCondominiumAddress() {
        return condominiumAddress;
    }

    public String getCondominiumTimezone() {
        return condominiumTimezone;
    }

    public UserRole getRole() {
        return role;
    }

    public boolean isActive() {
        return active;
    }
}
