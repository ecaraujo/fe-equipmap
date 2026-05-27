package br.com.equipmap.equipment.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "equipment")
public class Equipment {
    @Id
    private UUID id = UUID.randomUUID();

    @Column(name = "condominium_id", nullable = false)
    private UUID condominiumId;

    @Column(nullable = false, length = 160)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private EquipmentType type;

    @Column(nullable = false, length = 120)
    private String brand;

    @Column(nullable = false, length = 120)
    private String model;

    @Column(name = "serial_number", nullable = false, length = 120)
    private String serialNumber;

    @Column(name = "patrimony_code", nullable = false, length = 40)
    private String patrimonyCode;

    @Column(nullable = false, length = 160)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private EquipmentStatus status = EquipmentStatus.ACTIVE;

    @Column(name = "acquisition_date", nullable = false)
    private LocalDate acquisitionDate;

    @Column(name = "warranty_expiry", nullable = false)
    private LocalDate warrantyExpiry;

    @Column(name = "last_maintenance")
    private LocalDate lastMaintenance;

    @Column(name = "next_maintenance", nullable = false)
    private LocalDate nextMaintenance;

    @Column(name = "equipment_value", nullable = false, precision = 14, scale = 2)
    private BigDecimal value;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "created_by")
    private UUID createdBy;

    protected Equipment() {
    }

    public Equipment(
            UUID condominiumId,
            String name,
            EquipmentType type,
            String brand,
            String model,
            String serialNumber,
            String patrimonyCode,
            String location,
            EquipmentStatus status,
            LocalDate acquisitionDate,
            LocalDate warrantyExpiry,
            LocalDate nextMaintenance,
            BigDecimal value,
            UUID createdBy
    ) {
        this.condominiumId = condominiumId;
        this.name = name;
        this.type = type;
        this.brand = brand;
        this.model = model;
        this.serialNumber = serialNumber;
        this.patrimonyCode = patrimonyCode;
        this.location = location;
        this.status = status == null ? EquipmentStatus.ACTIVE : status;
        this.acquisitionDate = acquisitionDate;
        this.warrantyExpiry = warrantyExpiry;
        this.nextMaintenance = nextMaintenance;
        this.value = value;
        this.createdBy = createdBy;
        applyAutomaticStatus(LocalDate.now());
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public void update(
            String name,
            EquipmentType type,
            String brand,
            String model,
            String serialNumber,
            String location,
            EquipmentStatus status,
            LocalDate acquisitionDate,
            LocalDate warrantyExpiry,
            LocalDate nextMaintenance,
            BigDecimal value
    ) {
        if (name != null) {
            this.name = name;
        }
        if (type != null) {
            this.type = type;
        }
        if (brand != null) {
            this.brand = brand;
        }
        if (model != null) {
            this.model = model;
        }
        if (serialNumber != null) {
            this.serialNumber = serialNumber;
        }
        if (location != null) {
            this.location = location;
        }
        if (status != null) {
            this.status = status;
        }
        if (acquisitionDate != null) {
            this.acquisitionDate = acquisitionDate;
        }
        if (warrantyExpiry != null) {
            this.warrantyExpiry = warrantyExpiry;
        }
        if (nextMaintenance != null) {
            this.nextMaintenance = nextMaintenance;
        }
        if (value != null) {
            this.value = value;
        }
        applyAutomaticStatus(LocalDate.now());
    }

    public boolean applyAutomaticStatus(LocalDate today) {
        if (!isDeleted() && nextMaintenance != null && nextMaintenance.isBefore(today) && status != EquipmentStatus.ALERT) {
            status = EquipmentStatus.ALERT;
            return true;
        }
        return false;
    }

    public void softDelete() {
        deletedAt = Instant.now();
    }

    public void updateLastMaintenance(LocalDate completedDate) {
        lastMaintenance = completedDate;
        if (status == EquipmentStatus.ALERT) {
            status = EquipmentStatus.ACTIVE;
        }
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public UUID getId() {
        return id;
    }

    public UUID getCondominiumId() {
        return condominiumId;
    }

    public String getName() {
        return name;
    }

    public EquipmentType getType() {
        return type;
    }

    public String getBrand() {
        return brand;
    }

    public String getModel() {
        return model;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public String getPatrimonyCode() {
        return patrimonyCode;
    }

    public String getLocation() {
        return location;
    }

    public EquipmentStatus getStatus() {
        return status;
    }

    public LocalDate getAcquisitionDate() {
        return acquisitionDate;
    }

    public LocalDate getWarrantyExpiry() {
        return warrantyExpiry;
    }

    public LocalDate getLastMaintenance() {
        return lastMaintenance;
    }

    public LocalDate getNextMaintenance() {
        return nextMaintenance;
    }

    public BigDecimal getValue() {
        return value;
    }

    public Instant getDeletedAt() {
        return deletedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public UUID getCreatedBy() {
        return createdBy;
    }
}
