package br.com.equipmap.brigadier.service;

import br.com.equipmap.brigadier.api.dto.*;
import br.com.equipmap.brigadier.domain.*;
import br.com.equipmap.brigadier.repository.BrigadierRepository;
import br.com.equipmap.brigadier.repository.NotificationLogRepository;
import br.com.equipmap.brigadier.security.RequestPrincipal;
import br.com.equipmap.core.constants.RabbitMqConstants;
import br.com.equipmap.core.constants.RoutingKeys;
import br.com.equipmap.core.error.ErrorDetail;
import br.com.equipmap.core.error.ForbiddenException;
import br.com.equipmap.core.error.NotFoundException;
import br.com.equipmap.core.error.ValidationException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class BrigadierService {
    private final BrigadierRepository brigadierRepository;
    private final NotificationLogRepository logRepository;
    private final RabbitTemplate rabbitTemplate;
    private final int expiringWindowDays;

    public BrigadierService(BrigadierRepository brigadierRepository, NotificationLogRepository logRepository, RabbitTemplate rabbitTemplate,
                            @Value("${equipmap.brigadier.certification-expiring-window-days:90}") int expiringWindowDays) {
        this.brigadierRepository = brigadierRepository;
        this.logRepository = logRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.expiringWindowDays = expiringWindowDays;
    }

    @Transactional(readOnly = true)
    public List<BrigadierResponse> list(RequestPrincipal principal, String name, BrigadierRole role, CertificationStatus status) {
        LocalDate today = LocalDate.now();
        List<Brigadier> source = role == null
                ? brigadierRepository.findByCondominiumIdAndDeletedAtIsNullOrderByNameAsc(principal.condominiumId())
                : brigadierRepository.findByCondominiumIdAndRoleAndDeletedAtIsNullOrderByNameAsc(principal.condominiumId(), role);
        return source.stream()
                .filter(brigadier -> name == null || name.isBlank() || brigadier.getName().toLowerCase(Locale.ROOT).contains(name.toLowerCase(Locale.ROOT)))
                .filter(brigadier -> status == null || brigadier.certificationStatus(today, expiringWindowDays) == status)
                .map(brigadier -> BrigadierResponse.from(brigadier, today, expiringWindowDays))
                .toList();
    }

    @Transactional(readOnly = true)
    public BrigadierResponse get(RequestPrincipal principal, UUID id) {
        return BrigadierResponse.from(find(principal, id), LocalDate.now(), expiringWindowDays);
    }

    @Transactional
    public BrigadierResponse create(RequestPrincipal principal, CreateBrigadierRequest request) {
        requireWrite(principal);
        validateDates(request.certificationDate(), request.certificationExpiry());
        Brigadier brigadier = new Brigadier(principal.condominiumId(), request.name(), request.role(), request.phone(), request.email(),
                request.active(), request.certificationDate(), request.certificationExpiry(), request.notes());
        return BrigadierResponse.from(brigadierRepository.save(brigadier), LocalDate.now(), expiringWindowDays);
    }

    @Transactional
    public BrigadierResponse update(RequestPrincipal principal, UUID id, UpdateBrigadierRequest request) {
        requireWrite(principal);
        Brigadier brigadier = find(principal, id);
        LocalDate date = request.certificationDate() == null ? brigadier.getCertificationDate() : request.certificationDate();
        LocalDate expiry = request.certificationExpiry() == null ? brigadier.getCertificationExpiry() : request.certificationExpiry();
        validateDates(date, expiry);
        brigadier.update(request.name(), request.role(), request.phone(), request.email(), request.active(), request.certificationDate(), request.certificationExpiry(), request.notes());
        return BrigadierResponse.from(brigadier, LocalDate.now(), expiringWindowDays);
    }

    @Transactional
    public void delete(RequestPrincipal principal, UUID id) {
        requireWrite(principal);
        find(principal, id).delete();
    }

    @Transactional
    public NotifyBrigadiersResponse notify(RequestPrincipal principal, NotifyBrigadiersRequest request) {
        requireWrite(principal);
        if (request.message() == null || request.message().isBlank()) {
            throw new ValidationException("Message must not be empty", List.of(new ErrorDetail("message", "must not be blank")));
        }
        List<UUID> skippedInactive = new ArrayList<>();
        List<NotificationLog> logs = new ArrayList<>();
        for (UUID id : request.brigadierIds()) {
            Brigadier brigadier = find(principal, id);
            if (!brigadier.isActive()) {
                skippedInactive.add(id);
                continue;
            }
            logs.add(logRepository.save(new NotificationLog(principal.condominiumId(), brigadier, request.channel(), request.message())));
        }
        if (logs.isEmpty()) {
            throw new ValidationException("No active recipients", List.of(new ErrorDetail("brigadierIds", "at least one active recipient is required")));
        }
        for (NotificationLog log : logs) {
            rabbitTemplate.convertAndSend(RabbitMqConstants.BRIGADIER_EXCHANGE, RoutingKeys.BRIGADIER_NOTIFICATION_REQUESTED, new QueuedNotificationMessage(log.getId()));
        }
        return new NotifyBrigadiersResponse(request.brigadierIds().size(), logs.size(), skippedInactive);
    }

    @Transactional(readOnly = true)
    public List<NotificationLogResponse> logs(RequestPrincipal principal) {
        return logRepository.findByCondominiumIdOrderByCreatedAtDesc(principal.condominiumId()).stream()
                .map(NotificationLogResponse::from)
                .toList();
    }

    private Brigadier find(RequestPrincipal principal, UUID id) {
        return brigadierRepository.findByIdAndCondominiumIdAndDeletedAtIsNull(id, principal.condominiumId())
                .orElseThrow(() -> new NotFoundException("Brigadier not found"));
    }

    private void requireWrite(RequestPrincipal principal) {
        if (!principal.canWrite()) throw new ForbiddenException("User does not have permission to modify brigadiers");
    }

    private void validateDates(LocalDate certificationDate, LocalDate certificationExpiry) {
        if (certificationExpiry.isBefore(certificationDate)) {
            throw new ValidationException("Certification expiry must be on or after certification date",
                    List.of(new ErrorDetail("certificationExpiry", "must be on or after certificationDate")));
        }
    }
}
