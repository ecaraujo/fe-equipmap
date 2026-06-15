package br.com.equipmap.brigadier.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Entity
@Table(name = "brigadiers")
public class Brigadier {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID condominiumId;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(nullable = false, length = 40)
    private String apartment;

    @Column(nullable = false, length = 40)
    private String block;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private BrigadierRole role;

    @Column(nullable = false, length = 40)
    private String phone;

    @Column(length = 160)
    private String email;

    @Column(nullable = false)
    private boolean active;

    @Column(nullable = false)
    private LocalDate certificationDate;

    @Column(nullable = false)
    private LocalDate certificationExpiry;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private Instant deletedAt;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    protected Brigadier() {
    }

    public Brigadier(UUID condominiumId, String name, String apartment, String block, BrigadierRole role, String phone, String email, boolean active,
                     LocalDate certificationDate, LocalDate certificationExpiry, String notes) {
        this.condominiumId = condominiumId;
        this.name = name;
        this.apartment = apartment;
        this.block = block;
        this.role = role;
        this.phone = phone;
        this.email = email;
        this.active = active;
        this.certificationDate = certificationDate;
        this.certificationExpiry = certificationExpiry;
        this.notes = notes;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public CertificationStatus certificationStatus(LocalDate today, int expiringWindowDays) {
        if (certificationExpiry.isBefore(today)) return CertificationStatus.EXPIRED;
        long days = ChronoUnit.DAYS.between(today, certificationExpiry);
        return days <= expiringWindowDays ? CertificationStatus.EXPIRING : CertificationStatus.VALID;
    }

    public void update(String name, String apartment, String block, BrigadierRole role, String phone, String email, Boolean active,
                       LocalDate certificationDate, LocalDate certificationExpiry, String notes) {
        if (name != null) this.name = name;
        if (apartment != null) this.apartment = apartment;
        if (block != null) this.block = block;
        if (role != null) this.role = role;
        if (phone != null) this.phone = phone;
        if (email != null) this.email = email;
        if (active != null) this.active = active;
        if (certificationDate != null) this.certificationDate = certificationDate;
        if (certificationExpiry != null) this.certificationExpiry = certificationExpiry;
        if (notes != null) this.notes = notes;
    }

    public void delete() {
        deletedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getCondominiumId() { return condominiumId; }
    public String getName() { return name; }
    public String getApartment() { return apartment; }
    public String getBlock() { return block; }
    public BrigadierRole getRole() { return role; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public boolean isActive() { return active; }
    public LocalDate getCertificationDate() { return certificationDate; }
    public LocalDate getCertificationExpiry() { return certificationExpiry; }
    public String getNotes() { return notes; }
    public Instant getDeletedAt() { return deletedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
