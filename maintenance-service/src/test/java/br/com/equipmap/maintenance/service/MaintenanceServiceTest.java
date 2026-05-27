package br.com.equipmap.maintenance.service;

import br.com.equipmap.core.constants.RoutingKeys;
import br.com.equipmap.core.error.ForbiddenException;
import br.com.equipmap.core.error.ValidationException;
import br.com.equipmap.maintenance.api.dto.*;
import br.com.equipmap.maintenance.domain.*;
import br.com.equipmap.maintenance.repository.MaintenanceRecordRepository;
import br.com.equipmap.maintenance.repository.OutboxEventRepository;
import br.com.equipmap.maintenance.security.RequestPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class MaintenanceServiceTest {
    private static final UUID CONDOMINIUM_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID ADMIN_ID = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID VIEWER_ID = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    private static final UUID EQUIPMENT_ID = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");

    @Autowired
    private MaintenanceService service;

    @Autowired
    private MaintenanceRecordRepository repository;

    @Autowired
    private OutboxEventRepository outboxRepository;

    @MockitoBean
    private RabbitTemplate rabbitTemplate;

    @BeforeEach
    void cleanDatabase() {
        outboxRepository.deleteAll();
        repository.deleteAll();
    }

    @Test
    void createsPendingMaintenance() {
        MaintenanceResponse response = service.create(admin(), validCreate(MaintenanceType.PREVENTIVE, EQUIPMENT_ID, LocalDate.now().plusDays(2)));

        assertThat(response.status()).isEqualTo(MaintenanceStatus.PENDING);
        assertThat(response.equipmentId()).isEqualTo(EQUIPMENT_ID);
    }

    @Test
    void viewerCannotCreateMaintenance() {
        assertThatThrownBy(() -> service.create(viewer(), validCreate(MaintenanceType.PREVENTIVE, EQUIPMENT_ID, LocalDate.now().plusDays(2))))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void preventiveCannotCompleteBeforeScheduledDate() {
        MaintenanceResponse record = service.create(admin(), validCreate(MaintenanceType.PREVENTIVE, EQUIPMENT_ID, LocalDate.now().plusDays(5)));

        assertThatThrownBy(() -> service.complete(admin(), record.id(), new CompleteMaintenanceRequest(LocalDate.now(), BigDecimal.TEN, "early")))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void correctiveCanCompleteBeforeScheduledDateAndPublishesEvent() {
        MaintenanceResponse record = service.create(admin(), validCreate(MaintenanceType.CORRECTIVE, EQUIPMENT_ID, LocalDate.now().plusDays(5)));

        MaintenanceResponse completed = service.complete(admin(), record.id(), new CompleteMaintenanceRequest(LocalDate.now(), BigDecimal.TEN, "done"));

        assertThat(completed.status()).isEqualTo(MaintenanceStatus.COMPLETED);
        assertThat(outboxRepository.findAll()).extracting(OutboxEvent::getRoutingKey).contains(RoutingKeys.MAINTENANCE_COMPLETED);
    }

    @Test
    void overdueJobIsIdempotent() {
        service.create(admin(), validCreate(MaintenanceType.PREVENTIVE, EQUIPMENT_ID, LocalDate.now().minusDays(1)));

        int firstRun = service.markOverdue(LocalDate.now());
        int secondRun = service.markOverdue(LocalDate.now());

        assertThat(firstRun).isEqualTo(1);
        assertThat(secondRun).isZero();
        assertThat(outboxRepository.findAll()).extracting(OutboxEvent::getRoutingKey).containsExactly(RoutingKeys.MAINTENANCE_OVERDUE);
    }

    @Test
    void deleteSoftDeletesRecord() {
        MaintenanceResponse record = service.create(admin(), validCreate(MaintenanceType.PREVENTIVE, null, LocalDate.now().plusDays(1)));

        service.delete(admin(), record.id());
        PageResponse<MaintenanceResponse> page = service.list(admin(), null, null, null, 1, 20);

        assertThat(page.data()).isEmpty();
    }

    private RequestPrincipal admin() {
        return new RequestPrincipal(ADMIN_ID, UserRole.ADMIN, CONDOMINIUM_ID);
    }

    private RequestPrincipal viewer() {
        return new RequestPrincipal(VIEWER_ID, UserRole.VIEWER, CONDOMINIUM_ID);
    }

    private CreateMaintenanceRequest validCreate(MaintenanceType type, UUID equipmentId, LocalDate scheduledDate) {
        return new CreateMaintenanceRequest("Gerador", equipmentId, type, scheduledDate, "Tecnico", "Provider", "Maintenance description");
    }
}
