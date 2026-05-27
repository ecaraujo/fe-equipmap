package br.com.equipmap.parking.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "lottery_sessions")
public class LotterySession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID condominiumId;

    @Column(nullable = false)
    private long seed;

    @Column(nullable = false)
    private Instant drawnAt = Instant.now();

    @Column(nullable = false, columnDefinition = "TEXT")
    private String undrawnApartments = "[]";

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LotteryResult> results = new ArrayList<>();

    protected LotterySession() {
    }

    public LotterySession(UUID condominiumId, long seed, String undrawnApartments) {
        this.condominiumId = condominiumId;
        this.seed = seed;
        this.undrawnApartments = undrawnApartments;
    }

    public void addResult(LotteryResult result) {
        results.add(result);
        result.attachTo(this);
    }

    public UUID getId() { return id; }
    public UUID getCondominiumId() { return condominiumId; }
    public long getSeed() { return seed; }
    public Instant getDrawnAt() { return drawnAt; }
    public String getUndrawnApartments() { return undrawnApartments; }
    public List<LotteryResult> getResults() { return results; }
}
