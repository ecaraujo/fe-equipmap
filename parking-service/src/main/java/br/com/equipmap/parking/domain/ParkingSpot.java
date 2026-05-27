package br.com.equipmap.parking.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "parking_spots")
public class ParkingSpot {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID condominiumId;

    @Column(nullable = false, length = 40)
    private String number;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ParkingSpotType type;

    private Instant deletedAt;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    protected ParkingSpot() {
    }

    public ParkingSpot(UUID condominiumId, String number, ParkingSpotType type) {
        this.condominiumId = condominiumId;
        this.number = number;
        this.type = type;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public void update(String number, ParkingSpotType type) {
        if (number != null) this.number = number;
        if (type != null) this.type = type;
    }

    public void delete() {
        deletedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getCondominiumId() { return condominiumId; }
    public String getNumber() { return number; }
    public ParkingSpotType getType() { return type; }
    public Instant getDeletedAt() { return deletedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
