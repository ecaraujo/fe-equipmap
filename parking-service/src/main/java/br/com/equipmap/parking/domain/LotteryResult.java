package br.com.equipmap.parking.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "lottery_results")
public class LotteryResult {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID condominiumId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lottery_session_id", nullable = false)
    private LotterySession session;

    @Column(nullable = false)
    private UUID apartmentId;

    @Column(nullable = false)
    private UUID parkingSpotId;

    @Column(nullable = false, length = 40)
    private String unit;

    @Column(length = 80)
    private String block;

    @Column(nullable = false, length = 160)
    private String owner;

    @Column(nullable = false, length = 40)
    private String spotNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ParkingSpotType spotType;

    @Column(nullable = false)
    private long seed;

    @Column(nullable = false)
    private Instant drawnAt;

    protected LotteryResult() {
    }

    public LotteryResult(UUID condominiumId, Apartment apartment, ParkingSpot spot, long seed, Instant drawnAt) {
        this.condominiumId = condominiumId;
        this.apartmentId = apartment.getId();
        this.parkingSpotId = spot.getId();
        this.unit = apartment.getUnit();
        this.block = apartment.getBlock();
        this.owner = apartment.getOwner();
        this.spotNumber = spot.getNumber();
        this.spotType = spot.getType();
        this.seed = seed;
        this.drawnAt = drawnAt;
    }

    void attachTo(LotterySession session) {
        this.session = session;
    }

    public UUID getId() { return id; }
    public UUID getCondominiumId() { return condominiumId; }
    public UUID getApartmentId() { return apartmentId; }
    public UUID getParkingSpotId() { return parkingSpotId; }
    public String getUnit() { return unit; }
    public String getBlock() { return block; }
    public String getOwner() { return owner; }
    public String getSpotNumber() { return spotNumber; }
    public ParkingSpotType getSpotType() { return spotType; }
    public long getSeed() { return seed; }
    public Instant getDrawnAt() { return drawnAt; }
}
