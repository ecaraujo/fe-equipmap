package br.com.equipmap.warranty.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Entity
@Table(name = "warranties")
public class Warranty {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID condominiumId;

    @Column(nullable = false, length = 160)
    private String equipment;

    private UUID equipmentId;

    @Column(nullable = false, length = 120)
    private String brand;

    @Column(nullable = false, length = 120)
    private String model;

    @Column(length = 120)
    private String serialNumber;

    @Column(nullable = false, length = 160)
    private String supplier;

    @Column(length = 160)
    private String supplierContact;

    @Column(nullable = false)
    private LocalDate purchaseDate;

    @Column(nullable = false)
    private LocalDate warrantyStart;

    @Column(nullable = false)
    private LocalDate warrantyEnd;

    @Column(nullable = false)
    private Integer warrantyMonths;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private WarrantyType type;

    @Column(columnDefinition = "TEXT")
    private String observations;

    @Column(length = 500)
    private String documentObjectKey;

    @Column(length = 255)
    private String documentFileName;

    @Column(length = 120)
    private String documentMimeType;

    private Long documentSizeBytes;

    private Instant deletedAt;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    private UUID createdBy;

    protected Warranty() {
    }

    public Warranty(UUID condominiumId, String equipment, UUID equipmentId, String brand, String model, String serialNumber,
                    String supplier, String supplierContact, LocalDate purchaseDate, LocalDate warrantyStart,
                    LocalDate warrantyEnd, Integer warrantyMonths, WarrantyType type, String observations, UUID createdBy) {
        this.condominiumId = condominiumId;
        this.equipment = equipment;
        this.equipmentId = equipmentId;
        this.brand = brand;
        this.model = model;
        this.serialNumber = serialNumber;
        this.supplier = supplier;
        this.supplierContact = supplierContact;
        this.purchaseDate = purchaseDate;
        this.warrantyStart = warrantyStart;
        this.warrantyEnd = warrantyEnd;
        this.warrantyMonths = warrantyMonths;
        this.type = type;
        this.observations = observations;
        this.createdBy = createdBy;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public WarrantyStatus status(LocalDate today, int expiringWindowDays) {
        if (warrantyEnd.isBefore(today)) return WarrantyStatus.EXPIRED;
        long days = ChronoUnit.DAYS.between(today, warrantyEnd);
        return days <= expiringWindowDays ? WarrantyStatus.EXPIRING : WarrantyStatus.ACTIVE;
    }

    public void update(String equipment, UUID equipmentId, String brand, String model, String serialNumber, String supplier,
                       String supplierContact, LocalDate purchaseDate, LocalDate warrantyStart, LocalDate warrantyEnd,
                       Integer warrantyMonths, WarrantyType type, String observations) {
        if (equipment != null) this.equipment = equipment;
        if (equipmentId != null) this.equipmentId = equipmentId;
        if (brand != null) this.brand = brand;
        if (model != null) this.model = model;
        if (serialNumber != null) this.serialNumber = serialNumber;
        if (supplier != null) this.supplier = supplier;
        if (supplierContact != null) this.supplierContact = supplierContact;
        if (purchaseDate != null) this.purchaseDate = purchaseDate;
        if (warrantyStart != null) this.warrantyStart = warrantyStart;
        if (warrantyEnd != null) this.warrantyEnd = warrantyEnd;
        if (warrantyMonths != null) this.warrantyMonths = warrantyMonths;
        if (type != null) this.type = type;
        if (observations != null) this.observations = observations;
    }

    public void linkDocument(String objectKey, String fileName, String mimeType, long sizeBytes) {
        this.documentObjectKey = objectKey;
        this.documentFileName = fileName;
        this.documentMimeType = mimeType;
        this.documentSizeBytes = sizeBytes;
    }

    public void delete() {
        this.deletedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getCondominiumId() { return condominiumId; }
    public String getEquipment() { return equipment; }
    public UUID getEquipmentId() { return equipmentId; }
    public String getBrand() { return brand; }
    public String getModel() { return model; }
    public String getSerialNumber() { return serialNumber; }
    public String getSupplier() { return supplier; }
    public String getSupplierContact() { return supplierContact; }
    public LocalDate getPurchaseDate() { return purchaseDate; }
    public LocalDate getWarrantyStart() { return warrantyStart; }
    public LocalDate getWarrantyEnd() { return warrantyEnd; }
    public Integer getWarrantyMonths() { return warrantyMonths; }
    public WarrantyType getType() { return type; }
    public String getObservations() { return observations; }
    public String getDocumentObjectKey() { return documentObjectKey; }
    public String getDocumentFileName() { return documentFileName; }
    public String getDocumentMimeType() { return documentMimeType; }
    public Long getDocumentSizeBytes() { return documentSizeBytes; }
    public Instant getDeletedAt() { return deletedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public UUID getCreatedBy() { return createdBy; }
}
