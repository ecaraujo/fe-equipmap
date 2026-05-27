package br.com.equipmap.warranty.api.dto;

import br.com.equipmap.warranty.domain.Warranty;
import br.com.equipmap.warranty.domain.WarrantyStatus;
import br.com.equipmap.warranty.domain.WarrantyType;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record WarrantyResponse(
        UUID id,
        UUID condominiumId,
        String equipment,
        UUID equipmentId,
        String brand,
        String model,
        String serialNumber,
        String supplier,
        String supplierContact,
        LocalDate purchaseDate,
        LocalDate warrantyStart,
        LocalDate warrantyEnd,
        Integer warrantyMonths,
        WarrantyType type,
        WarrantyStatus status,
        String observations,
        String documentObjectKey,
        String documentFileName,
        String documentMimeType,
        Long documentSizeBytes,
        Instant createdAt,
        Instant updatedAt
) {
    public static WarrantyResponse from(Warranty warranty, LocalDate today, int expiringWindowDays) {
        return new WarrantyResponse(
                warranty.getId(),
                warranty.getCondominiumId(),
                warranty.getEquipment(),
                warranty.getEquipmentId(),
                warranty.getBrand(),
                warranty.getModel(),
                warranty.getSerialNumber(),
                warranty.getSupplier(),
                warranty.getSupplierContact(),
                warranty.getPurchaseDate(),
                warranty.getWarrantyStart(),
                warranty.getWarrantyEnd(),
                warranty.getWarrantyMonths(),
                warranty.getType(),
                warranty.status(today, expiringWindowDays),
                warranty.getObservations(),
                warranty.getDocumentObjectKey(),
                warranty.getDocumentFileName(),
                warranty.getDocumentMimeType(),
                warranty.getDocumentSizeBytes(),
                warranty.getCreatedAt(),
                warranty.getUpdatedAt()
        );
    }
}
