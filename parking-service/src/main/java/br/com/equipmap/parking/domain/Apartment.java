package br.com.equipmap.parking.domain;

import jakarta.persistence.*;

import java.time.Instant;
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

    @Column(length = 80)
    private String block;

    @Column(nullable = false, length = 160)
    private String owner;

    @Column(nullable = false)
    private boolean hasVehicle;

    private Instant deletedAt;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    protected Apartment() {
    }

    public Apartment(UUID condominiumId, String unit, String block, String owner, boolean hasVehicle) {
        this.condominiumId = condominiumId;
        this.unit = unit;
        this.block = block;
        this.owner = owner;
        this.hasVehicle = hasVehicle;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public void update(String unit, String block, String owner, Boolean hasVehicle) {
        if (unit != null) this.unit = unit;
        if (block != null) this.block = block;
        if (owner != null) this.owner = owner;
        if (hasVehicle != null) this.hasVehicle = hasVehicle;
    }

    public void delete() {
        deletedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getCondominiumId() { return condominiumId; }
    public String getUnit() { return unit; }
    public String getBlock() { return block; }
    public String getOwner() { return owner; }
    public boolean isHasVehicle() { return hasVehicle; }
    public Instant getDeletedAt() { return deletedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
