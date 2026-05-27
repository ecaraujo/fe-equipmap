package br.com.equipmap.condominium.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "condominiums")
public class Condominium {
    @Id
    private UUID id = UUID.randomUUID();

    @Column(nullable = false, length = 160)
    private String name;

    @Column(nullable = false, unique = true, length = 20)
    private String cnpj;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false, length = 80)
    private String timezone = "America/Sao_Paulo";

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "active_dependencies_count", nullable = false)
    private int activeDependenciesCount;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "condominium", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CondominiumUser> users = new ArrayList<>();

    protected Condominium() {
    }

    public Condominium(String name, String cnpj, String address, String timezone) {
        this.name = name;
        this.cnpj = normalizeCnpj(cnpj);
        this.address = address;
        this.timezone = timezone == null || timezone.isBlank() ? "America/Sao_Paulo" : timezone;
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCnpj() {
        return cnpj;
    }

    public String getAddress() {
        return address;
    }

    public String getTimezone() {
        return timezone;
    }

    public boolean isActive() {
        return active;
    }

    public int getActiveDependenciesCount() {
        return activeDependenciesCount;
    }

    public List<CondominiumUser> getUsers() {
        return users;
    }

    public void update(String name, String cnpj, String address, String timezone, Boolean active) {
        this.name = name;
        this.cnpj = normalizeCnpj(cnpj);
        this.address = address;
        this.timezone = timezone == null || timezone.isBlank() ? "America/Sao_Paulo" : timezone;
        if (active != null) {
            this.active = active;
        }
    }

    public void deactivate() {
        this.active = false;
    }

    public static String normalizeCnpj(String cnpj) {
        return cnpj == null ? null : cnpj.replaceAll("\\D", "");
    }
}
