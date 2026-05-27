package br.com.equipmap.warranty.service;

import br.com.equipmap.core.constants.StorageConstants;
import br.com.equipmap.core.error.ApiException;
import br.com.equipmap.core.error.ErrorDetail;
import br.com.equipmap.core.error.ForbiddenException;
import br.com.equipmap.core.error.NotFoundException;
import br.com.equipmap.core.error.ValidationException;
import br.com.equipmap.core.storage.PresignedUploadUrl;
import br.com.equipmap.core.storage.StorageUploadRequest;
import br.com.equipmap.core.storage.StoredObjectMetadata;
import br.com.equipmap.warranty.api.PayloadTooLargeException;
import br.com.equipmap.warranty.api.dto.*;
import br.com.equipmap.warranty.config.StorageProperties;
import br.com.equipmap.warranty.domain.Warranty;
import br.com.equipmap.warranty.domain.WarrantyStatus;
import br.com.equipmap.warranty.domain.WarrantyType;
import br.com.equipmap.warranty.repository.WarrantyRepository;
import br.com.equipmap.warranty.security.RequestPrincipal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class WarrantyService {
    private final WarrantyRepository repository;
    private final MinioStorageService storageService;
    private final StorageProperties storageProperties;
    private final int expiringWindowDays;

    public WarrantyService(WarrantyRepository repository, MinioStorageService storageService, StorageProperties storageProperties,
                           @Value("${equipmap.warranty.expiring-window-days:30}") int expiringWindowDays) {
        this.repository = repository;
        this.storageService = storageService;
        this.storageProperties = storageProperties;
        this.expiringWindowDays = expiringWindowDays;
    }

    @Transactional(readOnly = true)
    public PageResponse<WarrantyResponse> list(RequestPrincipal principal, String search, WarrantyType type, WarrantyStatus status, int page, int pageSize) {
        int normalizedPage = Math.max(page, 1);
        int normalizedPageSize = Math.max(1, Math.min(pageSize, 100));
        LocalDate today = LocalDate.now();
        List<Warranty> warranties = type == null
                ? repository.findByCondominiumIdAndDeletedAtIsNullOrderByWarrantyEndAsc(principal.condominiumId())
                : repository.findByCondominiumIdAndTypeAndDeletedAtIsNullOrderByWarrantyEndAsc(principal.condominiumId(), type);
        List<WarrantyResponse> filtered = warranties.stream()
                .filter(warranty -> matchesSearch(warranty, search))
                .filter(warranty -> status == null || warranty.status(today, expiringWindowDays) == status)
                .sorted(Comparator.comparing(Warranty::getWarrantyEnd))
                .map(warranty -> WarrantyResponse.from(warranty, today, expiringWindowDays))
                .toList();
        int from = Math.min((normalizedPage - 1) * normalizedPageSize, filtered.size());
        int to = Math.min(from + normalizedPageSize, filtered.size());
        int totalPages = (int) Math.ceil(filtered.size() / (double) normalizedPageSize);
        return new PageResponse<>(filtered.subList(from, to), new PageInfo(normalizedPage, normalizedPageSize, filtered.size(), totalPages));
    }

    @Transactional(readOnly = true)
    public WarrantyResponse get(RequestPrincipal principal, UUID id) {
        return WarrantyResponse.from(find(principal, id), LocalDate.now(), expiringWindowDays);
    }

    @Transactional
    public WarrantyResponse create(RequestPrincipal principal, CreateWarrantyRequest request) {
        requireWrite(principal);
        validateDateRange(request.warrantyStart(), request.warrantyEnd());
        Warranty warranty = new Warranty(principal.condominiumId(), request.equipment(), request.equipmentId(), request.brand(),
                request.model(), request.serialNumber(), request.supplier(), request.supplierContact(), request.purchaseDate(),
                request.warrantyStart(), request.warrantyEnd(), request.warrantyMonths(), request.type(), request.observations(), principal.userId());
        return WarrantyResponse.from(repository.save(warranty), LocalDate.now(), expiringWindowDays);
    }

    @Transactional
    public WarrantyResponse update(RequestPrincipal principal, UUID id, UpdateWarrantyRequest request) {
        requireWrite(principal);
        Warranty warranty = find(principal, id);
        LocalDate effectiveStart = request.warrantyStart() == null ? warranty.getWarrantyStart() : request.warrantyStart();
        LocalDate effectiveEnd = request.warrantyEnd() == null ? warranty.getWarrantyEnd() : request.warrantyEnd();
        validateDateRange(effectiveStart, effectiveEnd);
        warranty.update(request.equipment(), request.equipmentId(), request.brand(), request.model(), request.serialNumber(),
                request.supplier(), request.supplierContact(), request.purchaseDate(), request.warrantyStart(), request.warrantyEnd(),
                request.warrantyMonths(), request.type(), request.observations());
        return WarrantyResponse.from(warranty, LocalDate.now(), expiringWindowDays);
    }

    @Transactional
    public void delete(RequestPrincipal principal, UUID id) {
        requireWrite(principal);
        find(principal, id).delete();
    }

    @Transactional(readOnly = true)
    public UploadUrlResponse uploadUrl(RequestPrincipal principal, UUID id, UploadUrlRequest request) {
        requireWrite(principal);
        find(principal, id);
        validateUpload(request.mimeType(), request.sizeBytes());
        String objectKey = "warranties/%s/%s/%s-%s".formatted(principal.condominiumId(), id, UUID.randomUUID(), sanitizeFileName(request.fileName()));
        try {
            PresignedUploadUrl presignedUrl = storageService.generatePresignedUrl(new StorageUploadRequest(
                    storageProperties.bucket(),
                    objectKey,
                    request.fileName(),
                    request.mimeType(),
                    request.sizeBytes(),
                    StorageConstants.WARRANTY_DOCUMENT_MAX_BYTES,
                    StorageConstants.WARRANTY_DOCUMENT_ACCEPTED_MIME_TYPES,
                    Duration.ofMinutes(storageProperties.presignedExpirationMinutes())
            ));
            return new UploadUrlResponse(objectKey, presignedUrl.uploadUrl(), presignedUrl.documentUrl(), presignedUrl.expiresAt(),
                    presignedUrl.maxBytes(), presignedUrl.acceptedMimeTypes());
        } catch (RuntimeException exception) {
            throw new ApiException(502, "BAD_GATEWAY", "Storage service unavailable");
        }
    }

    @Transactional
    public WarrantyResponse confirmUpload(RequestPrincipal principal, UUID id, ConfirmUploadRequest request) {
        requireWrite(principal);
        Warranty warranty = find(principal, id);
        validateUpload(request.mimeType(), request.sizeBytes());
        if (!request.mimeType().equalsIgnoreCase(request.detectedMimeType())) {
            throw invalidMimeType();
        }
        storageService.recordConfirmedMetadata(request.objectKey(), request.detectedMimeType(), request.sizeBytes(), request.checksum());
        if (!storageService.validateMimeType(request.objectKey(), request.mimeType())) {
            throw invalidMimeType();
        }
        StoredObjectMetadata metadata = storageService.getObjectMetadata(request.objectKey());
        if (metadata == null) {
            throw new ApiException(502, "BAD_GATEWAY", "Storage object metadata unavailable");
        }
        warranty.linkDocument(request.objectKey(), request.fileName(), metadata.contentType(), metadata.sizeBytes());
        return WarrantyResponse.from(warranty, LocalDate.now(), expiringWindowDays);
    }

    private Warranty find(RequestPrincipal principal, UUID id) {
        return repository.findByIdAndCondominiumIdAndDeletedAtIsNull(id, principal.condominiumId())
                .orElseThrow(() -> new NotFoundException("Warranty not found"));
    }

    private void requireWrite(RequestPrincipal principal) {
        if (!principal.canWrite()) throw new ForbiddenException("User does not have permission to modify warranties");
    }

    private void validateDateRange(LocalDate warrantyStart, LocalDate warrantyEnd) {
        if (warrantyEnd.isBefore(warrantyStart)) {
            throw new ValidationException("Warranty end must be on or after warranty start", List.of(new ErrorDetail("warrantyEnd", "must be on or after warrantyStart")));
        }
    }

    private void validateUpload(String mimeType, long sizeBytes) {
        if (sizeBytes > StorageConstants.WARRANTY_DOCUMENT_MAX_BYTES) {
            throw new PayloadTooLargeException("Warranty document exceeds 10MB");
        }
        if (!StorageConstants.WARRANTY_DOCUMENT_ACCEPTED_MIME_TYPES.contains(mimeType.toLowerCase(Locale.ROOT))) {
            throw invalidMimeType();
        }
    }

    private ValidationException invalidMimeType() {
        return new ValidationException("Invalid file type. Accepted types: PDF, JPG, JPEG, PNG",
                List.of(new ErrorDetail("mimeType", "accepted: " + StorageConstants.WARRANTY_DOCUMENT_ACCEPTED_MIME_TYPES)));
    }

    private boolean matchesSearch(Warranty warranty, String search) {
        if (search == null || search.isBlank()) return true;
        String normalized = search.toLowerCase(Locale.ROOT);
        return warranty.getEquipment().toLowerCase(Locale.ROOT).contains(normalized)
                || warranty.getSupplier().toLowerCase(Locale.ROOT).contains(normalized)
                || warranty.getBrand().toLowerCase(Locale.ROOT).contains(normalized)
                || warranty.getModel().toLowerCase(Locale.ROOT).contains(normalized);
    }

    private String sanitizeFileName(String fileName) {
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
