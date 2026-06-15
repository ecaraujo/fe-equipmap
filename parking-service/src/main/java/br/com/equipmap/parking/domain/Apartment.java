package br.com.equipmap.parking.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "apartments")
public class Apartment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID condominiumId;

    @Column(nullable = false, length = 40)
    private String unit;

    @Column(nullable = false, length = 80)
    private String block;

    @Column(nullable = false, length = 160)
    private String owner;

    @Column(nullable = false, length = 160)
    private String ownerName;

    private Integer floor;

    @Column(length = 32)
    private String ownerDocument;

    @Column(length = 20)
    private String ownerPhone;

    @Column(length = 160)
    private String ownerEmail;

    @Column(nullable = false)
    private boolean rented;

    @Column(length = 160)
    private String tenantName;

    @Column(length = 32)
    private String tenantDocument;

    @Column(length = 20)
    private String tenantPhone;

    @Column(length = 160)
    private String tenantEmail;

    private LocalDate rentalStart;

    private LocalDate rentalEnd;

    @Column(nullable = false)
    private boolean hasVehicle;

    @Column(length = 1000)
    private String observations;

    private Instant deletedAt;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    protected Apartment() {
    }

    public Apartment(UUID condominiumId, ApartmentDetails details) {
        this.condominiumId = condominiumId;
        update(details);
    }

    @PrePersist
    void prePersist() {
        syncOwnerAlias();
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        syncOwnerAlias();
        updatedAt = Instant.now();
    }

    public void update(ApartmentDetails details) {
        this.unit = details.unit();
        this.block = details.block();
        this.floor = details.floor();
        this.ownerName = details.ownerName();
        this.ownerDocument = details.ownerDocument();
        this.ownerPhone = details.ownerPhone();
        this.ownerEmail = details.ownerEmail();
        this.rented = details.rented();
        this.tenantName = details.tenantName();
        this.tenantDocument = details.tenantDocument();
        this.tenantPhone = details.tenantPhone();
        this.tenantEmail = details.tenantEmail();
        this.rentalStart = details.rentalStart();
        this.rentalEnd = details.rentalEnd();
        this.hasVehicle = details.hasVehicle();
        this.observations = details.observations();
        syncOwnerAlias();
    }

    public void delete() {
        deletedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getCondominiumId() { return condominiumId; }
    public String getUnit() { return unit; }
    public String getBlock() { return block; }
    public String getOwner() { return ownerName == null ? owner : ownerName; }
    public String getOwnerName() { return ownerName; }
    public Integer getFloor() { return floor; }
    public String getOwnerDocument() { return ownerDocument; }
    public String getOwnerPhone() { return ownerPhone; }
    public String getOwnerEmail() { return ownerEmail; }
    public boolean isRented() { return rented; }
    public String getTenantName() { return tenantName; }
    public String getTenantDocument() { return tenantDocument; }
    public String getTenantPhone() { return tenantPhone; }
    public String getTenantEmail() { return tenantEmail; }
    public LocalDate getRentalStart() { return rentalStart; }
    public LocalDate getRentalEnd() { return rentalEnd; }
    public boolean isHasVehicle() { return hasVehicle; }
    public String getObservations() { return observations; }
    public Instant getDeletedAt() { return deletedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    private void syncOwnerAlias() {
        owner = ownerName;
    }
}
