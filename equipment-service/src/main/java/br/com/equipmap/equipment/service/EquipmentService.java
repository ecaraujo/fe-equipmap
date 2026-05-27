package br.com.equipmap.equipment.service;

import br.com.equipmap.core.constants.RoutingKeys;
import br.com.equipmap.core.error.ErrorDetail;
import br.com.equipmap.core.error.ForbiddenException;
import br.com.equipmap.core.error.NotFoundException;
import br.com.equipmap.core.error.ValidationException;
import br.com.equipmap.core.events.EventSeverity;
import br.com.equipmap.equipment.api.dto.CreateEquipmentRequest;
import br.com.equipmap.equipment.api.dto.EquipmentResponse;
import br.com.equipmap.equipment.api.dto.PageInfo;
import br.com.equipmap.equipment.api.dto.PageResponse;
import br.com.equipmap.equipment.api.dto.UpdateEquipmentRequest;
import br.com.equipmap.equipment.domain.Equipment;
import br.com.equipmap.equipment.domain.EquipmentStatus;
import br.com.equipmap.equipment.domain.EquipmentType;
import br.com.equipmap.equipment.repository.EquipmentRepository;
import br.com.equipmap.equipment.security.RequestPrincipal;
import jakarta.persistence.criteria.Predicate;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class EquipmentService {
    private static final Pattern PATRIMONY_SEQUENCE = Pattern.compile("EQ-\\d{4}-(\\d{4})");

    private final EquipmentRepository equipmentRepository;
    private final OutboxService outboxService;

    public EquipmentService(EquipmentRepository equipmentRepository, OutboxService outboxService) {
        this.equipmentRepository = equipmentRepository;
        this.outboxService = outboxService;
    }

    @Transactional(readOnly = true)
    public PageResponse<EquipmentResponse> list(
            RequestPrincipal principal,
            String search,
            EquipmentType type,
            EquipmentStatus status,
            boolean includeDeleted,
            int page,
            int pageSize
    ) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), Math.min(Math.max(pageSize, 1), 100));
        Page<EquipmentResponse> result = equipmentRepository.findAll(
                        specification(principal.condominiumId(), search, type, status, includeDeleted),
                        pageable
                )
                .map(EquipmentResponse::from);

        return new PageResponse<>(
                result.getContent(),
                new PageInfo(result.getTotalElements(), page, pageSize, result.getTotalPages())
        );
    }

    @Transactional(readOnly = true)
    public EquipmentResponse get(RequestPrincipal principal, UUID id) {
        return EquipmentResponse.from(findByTenant(principal, id));
    }

    @Transactional
    public EquipmentResponse create(RequestPrincipal principal, CreateEquipmentRequest request) {
        requireWrite(principal);
        validateDatesAndValue(request.acquisitionDate(), request.nextMaintenance(), request.value());

        Equipment equipment = new Equipment(
                principal.condominiumId(),
                request.name(),
                request.type(),
                request.brand(),
                request.model(),
                request.serialNumber(),
                nextPatrimonyCode(principal.condominiumId()),
                request.location(),
                request.status(),
                request.acquisitionDate(),
                request.warrantyExpiry(),
                request.nextMaintenance(),
                request.value(),
                principal.userId()
        );

        try {
            Equipment saved = equipmentRepository.saveAndFlush(equipment);
            publishDueEvents(saved, true, true);
            return EquipmentResponse.from(saved);
        } catch (DataIntegrityViolationException exception) {
            throw new br.com.equipmap.core.error.ConflictException("Patrimony code already exists for condominium");
        }
    }

    @Transactional
    public EquipmentResponse update(RequestPrincipal principal, UUID id, UpdateEquipmentRequest request) {
        requireWrite(principal);
        Equipment equipment = findByTenant(principal, id);
        LocalDate previousWarrantyExpiry = equipment.getWarrantyExpiry();
        LocalDate acquisitionDate = request.acquisitionDate() == null ? equipment.getAcquisitionDate() : request.acquisitionDate();
        LocalDate nextMaintenance = request.nextMaintenance() == null ? equipment.getNextMaintenance() : request.nextMaintenance();
        BigDecimal value = request.value() == null ? equipment.getValue() : request.value();
        validateDatesAndValue(acquisitionDate, nextMaintenance, value);

        equipment.update(
                request.name(),
                request.type(),
                request.brand(),
                request.model(),
                request.serialNumber(),
                request.location(),
                request.status(),
                request.acquisitionDate(),
                request.warrantyExpiry(),
                request.nextMaintenance(),
                request.value()
        );
        publishDueEvents(equipment, true, !previousWarrantyExpiry.equals(equipment.getWarrantyExpiry()));
        return EquipmentResponse.from(equipment);
    }

    @Transactional
    public void delete(RequestPrincipal principal, UUID id) {
        requireWrite(principal);
        Equipment equipment = findByTenant(principal, id);
        equipment.softDelete();
    }

    @Transactional
    public int markOverdueMaintenance(LocalDate today) {
        int changed = 0;
        for (Equipment equipment : equipmentRepository.findByDeletedAtIsNullAndNextMaintenanceBefore(today)) {
            if (equipment.applyAutomaticStatus(today)) {
                publishMaintenanceDue(equipment);
                changed++;
            }
        }
        return changed;
    }

    @Transactional
    public void updateLastMaintenance(UUID condominiumId, UUID equipmentId, LocalDate completedDate) {
        Equipment equipment = equipmentRepository.findByIdAndCondominiumId(equipmentId, condominiumId)
                .orElseThrow(() -> new NotFoundException("Equipment not found"));
        equipment.updateLastMaintenance(completedDate);
    }

    private Specification<Equipment> specification(UUID condominiumId, String search, EquipmentType type, EquipmentStatus status, boolean includeDeleted) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(builder.equal(root.get("condominiumId"), condominiumId));
            if (!includeDeleted) {
                predicates.add(builder.isNull(root.get("deletedAt")));
            }
            if (type != null) {
                predicates.add(builder.equal(root.get("type"), type));
            }
            if (status != null) {
                predicates.add(builder.equal(root.get("status"), status));
            }
            if (search != null && !search.isBlank()) {
                String like = "%" + search.toLowerCase() + "%";
                predicates.add(builder.or(
                        builder.like(builder.lower(root.get("name")), like),
                        builder.like(builder.lower(root.get("patrimonyCode")), like),
                        builder.like(builder.lower(root.get("serialNumber")), like),
                        builder.like(builder.lower(root.get("location")), like)
                ));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Equipment findByTenant(RequestPrincipal principal, UUID id) {
        return equipmentRepository.findByIdAndCondominiumId(id, principal.condominiumId())
                .orElseThrow(() -> new NotFoundException("Equipment not found"));
    }

    private void requireWrite(RequestPrincipal principal) {
        if (!principal.canWrite()) {
            throw new ForbiddenException("Only admins and managers can manage equipment");
        }
    }

    private void validateDatesAndValue(LocalDate acquisitionDate, LocalDate nextMaintenance, BigDecimal value) {
        List<ErrorDetail> details = new ArrayList<>();
        if (nextMaintenance != null && acquisitionDate != null && nextMaintenance.isBefore(acquisitionDate)) {
            details.add(new ErrorDetail("nextMaintenance", "must be greater than or equal to acquisitionDate"));
        }
        if (value != null && value.signum() < 0) {
            details.add(new ErrorDetail("value", "must be greater than or equal to 0"));
        }
        if (!details.isEmpty()) {
            throw new ValidationException("Invalid equipment data", details);
        }
    }

    private String nextPatrimonyCode(UUID condominiumId) {
        String current = equipmentRepository.maxPatrimonyCode(condominiumId);
        int next = 1;
        Matcher matcher = PATRIMONY_SEQUENCE.matcher(current == null ? "" : current);
        if (matcher.matches()) {
            next = Integer.parseInt(matcher.group(1)) + 1;
        }
        return "EQ-" + LocalDate.now().getYear() + "-" + String.format("%04d", next);
    }

    private void publishDueEvents(Equipment equipment, boolean maintenanceDue, boolean warrantyChanged) {
        if (maintenanceDue && equipment.getNextMaintenance().isBefore(LocalDate.now())) {
            publishMaintenanceDue(equipment);
        }
        long daysUntilWarranty = ChronoUnit.DAYS.between(LocalDate.now(), equipment.getWarrantyExpiry());
        if (warrantyChanged && daysUntilWarranty >= 0 && daysUntilWarranty <= 90) {
            outboxService.equipmentEvent(
                    equipment,
                    RoutingKeys.EQUIPMENT_WARRANTY_EXPIRING,
                    new EquipmentEvents.EquipmentWarrantyExpiringEvent(
                            UUID.randomUUID(),
                            equipment.getId().toString(),
                            equipment.getCondominiumId().toString(),
                            equipment.getWarrantyExpiry(),
                            (int) daysUntilWarranty,
                            EventSeverity.MEDIUM,
                            Instant.now()
                    )
            );
        }
    }

    private void publishMaintenanceDue(Equipment equipment) {
        outboxService.equipmentEvent(
                equipment,
                RoutingKeys.EQUIPMENT_MAINTENANCE_DUE,
                new EquipmentEvents.EquipmentMaintenanceDueEvent(
                        UUID.randomUUID(),
                        equipment.getId().toString(),
                        equipment.getCondominiumId().toString(),
                        equipment.getNextMaintenance(),
                        EventSeverity.HIGH,
                        Instant.now()
                )
        );
    }
}
