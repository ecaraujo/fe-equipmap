package br.com.equipmap.maintenance.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "maintenance_records")
public class MaintenanceRecord {
    @Id
    private UUID id = UUID.randomUUID();

    @Column(name = "condominium_id", nullable = false)
    private UUID condominiumId;

    @Column(nullable = false, length = 160)
    private String equipment;

    @Column(name = "equipment_id")
    private UUID equipmentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private MaintenanceType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private MaintenanceStatus status = MaintenanceStatus.PENDING;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Column(name = "completed_date")
    private LocalDate completedDate;

    @Column(length = 160)
    private String technician;

    @Column(length = 160)
    private String provider;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(precision = 14, scale = 2)
    private BigDecimal cost;

    @Column(columnDefinition = "TEXT")
    private String observations;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "created_by")
    private UUID createdBy;

    @Version
    @Column(nullable = false)
    private long version;

    protected MaintenanceRecord() {
    }

    public MaintenanceRecord(UUID condominiumId, String equipment, UUID equipmentId, MaintenanceType type, LocalDate scheduledDate, String technician, String provider, String description, UUID createdBy) {
        this.condominiumId = condominiumId;
        this.equipment = equipment;
        this.equipmentId = equipmentId;
        this.type = type;
        this.scheduledDate = scheduledDate;
        this.technician = technician;
        this.provider = provider;
        this.description = description;
        this.createdBy = createdBy;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public void update(String equipment, UUID equipmentId, MaintenanceType type, LocalDate scheduledDate, String technician, String provider, String description) {
        if (equipment != null) this.equipment = equipment;
        if (equipmentId != null) this.equipmentId = equipmentId;
        if (type != null) this.type = type;
        if (scheduledDate != null) this.scheduledDate = scheduledDate;
        if (technician != null) this.technician = technician;
        if (provider != null) this.provider = provider;
        if (description != null) this.description = description;
    }

    public void complete(LocalDate completedDate, BigDecimal cost, String observations) {
        this.completedDate = completedDate;
        this.cost = cost;
        this.observations = observations;
        this.status = MaintenanceStatus.COMPLETED;
    }

    public boolean markOverdue(LocalDate today) {
        if (status == MaintenanceStatus.PENDING && scheduledDate.isBefore(today)) {
            status = MaintenanceStatus.OVERDUE;
            return true;
        }
        return false;
    }

    public void softDelete() {
        deletedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getCondominiumId() { return condominiumId; }
    public String getEquipment() { return equipment; }
    public UUID getEquipmentId() { return equipmentId; }
    public MaintenanceType getType() { return type; }
    public MaintenanceStatus getStatus() { return status; }
    public LocalDate getScheduledDate() { return scheduledDate; }
    public LocalDate getCompletedDate() { return completedDate; }
    public String getTechnician() { return technician; }
    public String getProvider() { return provider; }
    public String getDescription() { return description; }
    public BigDecimal getCost() { return cost; }
    public String getObservations() { return observations; }
    public Instant getDeletedAt() { return deletedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public UUID getCreatedBy() { return createdBy; }
    public long getVersion() { return version; }
}
