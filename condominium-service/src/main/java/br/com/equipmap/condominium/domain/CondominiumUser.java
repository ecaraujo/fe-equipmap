package br.com.equipmap.condominium.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "condominium_users")
public class CondominiumUser {
    @Id
    private UUID id = UUID.randomUUID();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "condominium_id", nullable = false)
    private Condominium condominium;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "user_email", length = 320)
    private String userEmail;

    @Column(name = "user_name", length = 160)
    private String userName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private UserRole role;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected CondominiumUser() {
    }

    public CondominiumUser(Condominium condominium, UUID userId, String userEmail, String userName, UserRole role) {
        this.condominium = condominium;
        this.userId = userId;
        this.userEmail = userEmail;
        this.userName = userName;
        this.role = role;
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public Condominium getCondominium() {
        return condominium;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getUserName() {
        return userName;
    }

    public UserRole getRole() {
        return role;
    }

    public boolean isActive() {
        return active;
    }

    public void deactivate() {
        this.active = false;
    }

    public void updateRole(UserRole role) {
        this.role = role;
        this.active = true;
    }

    public void update(String userEmail, String userName, UserRole role) {
        this.userEmail = userEmail;
        this.userName = userName;
        this.role = role;
        this.active = true;
    }
}
