package br.com.equipmap.maintenance.service;

import br.com.equipmap.core.constants.RoutingKeys;
import br.com.equipmap.core.error.ErrorDetail;
import br.com.equipmap.core.error.ForbiddenException;
import br.com.equipmap.core.error.NotFoundException;
import br.com.equipmap.core.error.ValidationException;
import br.com.equipmap.core.events.EventSeverity;
import br.com.equipmap.core.events.MaintenanceCompletedEvent;
import br.com.equipmap.core.events.MaintenanceOverdueEvent;
import br.com.equipmap.maintenance.api.dto.*;
import br.com.equipmap.maintenance.domain.*;
import br.com.equipmap.maintenance.repository.MaintenanceRecordRepository;
import br.com.equipmap.maintenance.security.RequestPrincipal;
import jakarta.persistence.OptimisticLockException;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;

@Service
public class MaintenanceService {
    private final MaintenanceRecordRepository repository;
    private final OutboxService outboxService;

    public MaintenanceService(MaintenanceRecordRepository repository, OutboxService outboxService) {
        this.repository = repository;
        this.outboxService = outboxService;
    }

    @Transactional(readOnly = true)
    public PageResponse<MaintenanceResponse> list(RequestPrincipal principal, String search, MaintenanceType type, MaintenanceStatus status, int page, int pageSize) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), Math.min(Math.max(pageSize, 1), 100));
        Page<MaintenanceResponse> result = repository.findAll(spec(principal.condominiumId(), search, type, status), pageable).map(MaintenanceResponse::from);
        return new PageResponse<>(result.getContent(), new PageInfo(result.getTotalElements(), page, pageSize, result.getTotalPages()));
    }

    @Transactional(readOnly = true)
    public MaintenanceResponse get(RequestPrincipal principal, UUID id) {
        return MaintenanceResponse.from(find(principal, id));
    }

    @Transactional
    public MaintenanceResponse create(RequestPrincipal principal, CreateMaintenanceRequest request) {
        requireWrite(principal);
        MaintenanceRecord record = new MaintenanceRecord(principal.condominiumId(), request.equipment(), request.equipmentId(), request.type(), request.scheduledDate(), request.technician(), request.provider(), request.description(), principal.userId());
        return MaintenanceResponse.from(repository.save(record));
    }

    @Transactional
    public MaintenanceResponse update(RequestPrincipal principal, UUID id, UpdateMaintenanceRequest request) {
        requireWrite(principal);
        MaintenanceRecord record = find(principal, id);
        record.update(request.equipment(), request.equipmentId(), request.type(), request.scheduledDate(), request.technician(), request.provider(), request.description());
        return MaintenanceResponse.from(record);
    }

    @Transactional
    public MaintenanceResponse complete(RequestPrincipal principal, UUID id, CompleteMaintenanceRequest request) {
        requireWrite(principal);
        try {
            MaintenanceRecord record = find(principal, id);
            validateCompletion(record, request.completedDate());
            record.complete(request.completedDate(), request.cost(), request.observations());
            if (record.getEquipmentId() != null) {
                outboxService.maintenanceEvent(
                        record,
                        RoutingKeys.MAINTENANCE_COMPLETED,
                        new MaintenanceCompletedEvent(UUID.randomUUID(), record.getId().toString(), record.getEquipmentId().toString(), record.getCondominiumId().toString(), request.completedDate().atStartOfDay().toInstant(ZoneOffset.UTC), Instant.now()),
                        "maintenance.completed:" + record.getId()
                );
            }
            return MaintenanceResponse.from(record);
        } catch (ObjectOptimisticLockingFailureException | OptimisticLockException exception) {
            throw new br.com.equipmap.core.error.ConflictException("Maintenance was modified concurrently");
        }
    }

    @Transactional
    public void delete(RequestPrincipal principal, UUID id) {
        requireWrite(principal);
        find(principal, id).softDelete();
    }

    @Transactional
    public int markOverdue(LocalDate today) {
        int changed = 0;
        for (MaintenanceRecord record : repository.findByDeletedAtIsNullAndStatusAndScheduledDateBefore(MaintenanceStatus.PENDING, today)) {
            if (record.markOverdue(today)) {
                publishOverdue(record);
                changed++;
            }
        }
        return changed;
    }

    private void publishOverdue(MaintenanceRecord record) {
        outboxService.maintenanceEvent(
                record,
                RoutingKeys.MAINTENANCE_OVERDUE,
                new MaintenanceOverdueEvent(UUID.randomUUID(), record.getId().toString(), record.getEquipmentId() == null ? null : record.getEquipmentId().toString(), record.getCondominiumId().toString(), record.getScheduledDate().atStartOfDay().toInstant(ZoneOffset.UTC), EventSeverity.HIGH, Instant.now()),
                "maintenance.overdue:" + record.getId()
        );
    }

    private Specification<MaintenanceRecord> spec(UUID condominiumId, String search, MaintenanceType type, MaintenanceStatus status) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(builder.equal(root.get("condominiumId"), condominiumId));
            predicates.add(builder.isNull(root.get("deletedAt")));
            if (type != null) predicates.add(builder.equal(root.get("type"), type));
            if (status != null) predicates.add(builder.equal(root.get("status"), status));
            if (search != null && !search.isBlank()) {
                String like = "%" + search.toLowerCase() + "%";
                predicates.add(builder.or(builder.like(builder.lower(root.get("equipment")), like), builder.like(builder.lower(root.get("description")), like)));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private MaintenanceRecord find(RequestPrincipal principal, UUID id) {
        return repository.findByIdAndCondominiumId(id, principal.condominiumId()).filter(r -> r.getDeletedAt() == null).orElseThrow(() -> new NotFoundException("Maintenance record not found"));
    }

    private void requireWrite(RequestPrincipal principal) {
        if (!principal.canWrite()) throw new ForbiddenException("Only admins and managers can manage maintenance");
    }

    private void validateCompletion(MaintenanceRecord record, LocalDate completedDate) {
        if (record.getType() != MaintenanceType.CORRECTIVE && completedDate.isBefore(record.getScheduledDate())) {
            throw new ValidationException("Invalid maintenance completion date", List.of(new ErrorDetail("completedDate", "preventive and predictive maintenance cannot be completed before scheduledDate")));
        }
    }
}
