package br.com.equipmap.warranty.service;

import br.com.equipmap.core.constants.RoutingKeys;
import br.com.equipmap.core.events.EventSeverity;
import br.com.equipmap.core.events.WarrantyExpiredEvent;
import br.com.equipmap.core.events.WarrantyExpiringEvent;
import br.com.equipmap.warranty.domain.Warranty;
import br.com.equipmap.warranty.domain.WarrantyStatus;
import br.com.equipmap.warranty.repository.WarrantyRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class WarrantyScheduler {
    private final WarrantyRepository repository;
    private final OutboxService outboxService;
    private final int expiringWindowDays;
    private final ZoneId zoneId;

    public WarrantyScheduler(WarrantyRepository repository, OutboxService outboxService,
                             @Value("${equipmap.warranty.expiring-window-days:30}") int expiringWindowDays,
                             @Value("${equipmap.timezone:America/Sao_Paulo}") String timezone) {
        this.repository = repository;
        this.outboxService = outboxService;
        this.expiringWindowDays = expiringWindowDays;
        this.zoneId = ZoneId.of(timezone);
    }

    @Scheduled(cron = "0 15 2 * * *", zone = "${equipmap.timezone:America/Sao_Paulo}")
    @Transactional
    public void publishWarrantyAlerts() {
        publishWarrantyAlerts(LocalDate.now(zoneId));
    }

    @Transactional
    public int publishWarrantyAlerts(LocalDate today) {
        LocalDate maxDate = today.plusDays(expiringWindowDays);
        int published = 0;
        for (Warranty warranty : repository.findByDeletedAtIsNullAndWarrantyEndLessThanEqual(maxDate)) {
            WarrantyStatus status = warranty.status(today, expiringWindowDays);
            Instant occurredAt = Instant.now();
            if (status == WarrantyStatus.EXPIRED) {
                boolean created = outboxService.warrantyEvent(warranty, RoutingKeys.WARRANTY_EXPIRED, new WarrantyExpiredEvent(
                        UUID.randomUUID(),
                        warranty.getId().toString(),
                        warranty.getEquipmentId() == null ? null : warranty.getEquipmentId().toString(),
                        warranty.getCondominiumId().toString(),
                        warranty.getWarrantyEnd().atStartOfDay(zoneId).toInstant(),
                        EventSeverity.HIGH,
                        occurredAt
                ));
                if (created) published++;
            } else if (status == WarrantyStatus.EXPIRING) {
                int daysUntilExpiration = (int) ChronoUnit.DAYS.between(today, warranty.getWarrantyEnd());
                boolean created = outboxService.warrantyEvent(warranty, RoutingKeys.WARRANTY_EXPIRING, new WarrantyExpiringEvent(
                        UUID.randomUUID(),
                        warranty.getId().toString(),
                        warranty.getEquipmentId() == null ? null : warranty.getEquipmentId().toString(),
                        warranty.getCondominiumId().toString(),
                        warranty.getWarrantyEnd().atStartOfDay(zoneId).toInstant(),
                        daysUntilExpiration,
                        EventSeverity.MEDIUM,
                        occurredAt
                ));
                if (created) published++;
            }
        }
        return published;
    }
}
