package br.com.equipmap.notification;

import br.com.equipmap.core.constants.RoutingKeys;
import br.com.equipmap.core.error.ForbiddenException;
import br.com.equipmap.notification.config.RabbitMqConfig;
import br.com.equipmap.notification.domain.Notification;
import br.com.equipmap.notification.domain.NotificationSeverity;
import br.com.equipmap.notification.domain.NotificationType;
import br.com.equipmap.notification.domain.UserRole;
import br.com.equipmap.notification.repository.NotificationRepository;
import br.com.equipmap.notification.security.RequestPrincipal;
import br.com.equipmap.notification.service.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class NotificationServiceIntegrationTest {
    private static final UUID CONDOMINIUM_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID OTHER_CONDOMINIUM_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private static final UUID USER_ID = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID OTHER_USER_ID = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

    @Autowired
    NotificationService service;

    @Autowired
    NotificationRepository repository;

    @Autowired
    ObjectMapper objectMapper;

    @BeforeEach
    void cleanDatabase() {
        repository.deleteAll();
    }

    @Test
    void createsMaintenanceOverdueNotificationAndDeduplicatesActiveRecords() {
        ObjectNode payload = maintenancePayload("m-1", USER_ID, CONDOMINIUM_ID);

        Notification first = service.handleEvent(RoutingKeys.MAINTENANCE_OVERDUE, payload);
        Notification duplicate = service.handleEvent(RoutingKeys.MAINTENANCE_OVERDUE, payload);

        assertThat(first).isNotNull();
        assertThat(duplicate).isNull();
        assertThat(repository.findAll()).hasSize(1);
        assertThat(first.getType()).isEqualTo(NotificationType.MAINTENANCE_OVERDUE);
        assertThat(first.getSeverity()).isEqualTo(NotificationSeverity.HIGH);
    }

    @Test
    void allowsSameDedupKeyAfterLogicalDeletion() {
        ObjectNode payload = maintenancePayload("m-2", USER_ID, CONDOMINIUM_ID);
        RequestPrincipal principal = new RequestPrincipal(USER_ID, UserRole.MANAGER, CONDOMINIUM_ID);

        Notification first = service.handleEvent(RoutingKeys.MAINTENANCE_OVERDUE, payload);
        service.delete(first.getId(), principal);
        Notification recreated = service.handleEvent(RoutingKeys.MAINTENANCE_OVERDUE, payload);

        assertThat(recreated).isNotNull();
        assertThat(repository.findAll()).hasSize(2);
        assertThat(service.list(principal)).extracting(Notification::getId).containsExactly(recreated.getId());
    }

    @Test
    void mapsMediumSeverityEvents() {
        Notification warranty = service.handleEvent(RoutingKeys.WARRANTY_EXPIRING, warrantyPayload("w-1", USER_ID, CONDOMINIUM_ID));
        Notification maintenance = service.handleEvent(RabbitMqConfig.MAINTENANCE_PENDING_ROUTING_KEY, maintenancePayload("m-3", USER_ID, CONDOMINIUM_ID));

        assertThat(warranty.getType()).isEqualTo(NotificationType.WARRANTY_EXPIRING);
        assertThat(warranty.getSeverity()).isEqualTo(NotificationSeverity.MEDIUM);
        assertThat(maintenance.getType()).isEqualTo(NotificationType.MAINTENANCE_PENDING);
        assertThat(maintenance.getSeverity()).isEqualTo(NotificationSeverity.MEDIUM);
    }

    @Test
    void listsOnlyAuthenticatedUserAndCondominiumNotifications() {
        service.handleEvent(RoutingKeys.WARRANTY_EXPIRED, warrantyPayload("w-1", USER_ID, CONDOMINIUM_ID));
        service.handleEvent(RoutingKeys.WARRANTY_EXPIRED, warrantyPayload("w-2", OTHER_USER_ID, CONDOMINIUM_ID));
        service.handleEvent(RoutingKeys.WARRANTY_EXPIRED, warrantyPayload("w-3", USER_ID, OTHER_CONDOMINIUM_ID));

        List<Notification> notifications = service.list(new RequestPrincipal(USER_ID, UserRole.VIEWER, CONDOMINIUM_ID));

        assertThat(notifications).hasSize(1);
        assertThat(notifications.getFirst().getResourceId()).isEqualTo("w-1");
    }

    @Test
    void readOperationsAreIdempotent() {
        RequestPrincipal principal = new RequestPrincipal(USER_ID, UserRole.VIEWER, CONDOMINIUM_ID);
        Notification first = service.handleEvent(RoutingKeys.WARRANTY_EXPIRED, warrantyPayload("w-4", USER_ID, CONDOMINIUM_ID));
        service.handleEvent(RoutingKeys.WARRANTY_EXPIRING, warrantyPayload("w-5", USER_ID, CONDOMINIUM_ID));

        service.markRead(first.getId(), principal);
        service.markRead(first.getId(), principal);
        int updatedCount = service.markAllRead(principal);
        int secondUpdatedCount = service.markAllRead(principal);

        assertThat(updatedCount).isEqualTo(1);
        assertThat(secondUpdatedCount).isZero();
        assertThat(service.list(principal)).allMatch(Notification::isRead);
    }

    @Test
    void deleteRejectsNotificationsFromAnotherUser() {
        Notification notification = service.handleEvent(RoutingKeys.WARRANTY_EXPIRED, warrantyPayload("w-6", OTHER_USER_ID, CONDOMINIUM_ID));
        RequestPrincipal principal = new RequestPrincipal(USER_ID, UserRole.MANAGER, CONDOMINIUM_ID);

        assertThatThrownBy(() -> service.delete(notification.getId(), principal))
                .isInstanceOf(ForbiddenException.class);
    }

    private ObjectNode maintenancePayload(String maintenanceId, UUID userId, UUID condominiumId) {
        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("maintenanceId", maintenanceId);
        payload.put("equipmentId", "eq-1");
        payload.put("condominiumId", condominiumId.toString());
        payload.put("userId", userId.toString());
        return payload;
    }

    private ObjectNode warrantyPayload(String warrantyId, UUID userId, UUID condominiumId) {
        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("warrantyId", warrantyId);
        payload.put("equipmentId", "eq-1");
        payload.put("condominiumId", condominiumId.toString());
        payload.put("userId", userId.toString());
        return payload;
    }
}
