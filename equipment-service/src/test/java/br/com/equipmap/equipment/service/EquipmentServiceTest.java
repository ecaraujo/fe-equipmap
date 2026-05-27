package br.com.equipmap.equipment.service;

import br.com.equipmap.equipment.api.dto.CreateEquipmentRequest;
import br.com.equipmap.equipment.api.dto.EquipmentResponse;
import br.com.equipmap.equipment.api.dto.PageResponse;
import br.com.equipmap.equipment.api.dto.UpdateEquipmentRequest;
import br.com.equipmap.equipment.domain.EquipmentStatus;
import br.com.equipmap.equipment.domain.EquipmentType;
import br.com.equipmap.equipment.domain.OutboxEvent;
import br.com.equipmap.equipment.domain.UserRole;
import br.com.equipmap.equipment.repository.EquipmentRepository;
import br.com.equipmap.equipment.repository.OutboxEventRepository;
import br.com.equipmap.equipment.security.RequestPrincipal;
import br.com.equipmap.core.constants.RoutingKeys;
import br.com.equipmap.core.error.ForbiddenException;
import br.com.equipmap.core.error.ValidationException;
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
class EquipmentServiceTest {
    private static final UUID CONDOMINIUM_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID OTHER_CONDOMINIUM_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private static final UUID ADMIN_ID = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID VIEWER_ID = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

    @Autowired
    private EquipmentService service;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @MockitoBean
    private RabbitTemplate rabbitTemplate;

    @BeforeEach
    void cleanDatabase() {
        outboxEventRepository.deleteAll();
        equipmentRepository.deleteAll();
    }

    @Test
    void createsEquipmentWithGeneratedPatrimonyCode() {
        EquipmentResponse response = service.create(admin(), validRequest("Ar Condicionado"));

        assertThat(response.patrimonyCode()).isEqualTo("EQ-" + LocalDate.now().getYear() + "-0001");
        assertThat(response.condominiumId()).isEqualTo(CONDOMINIUM_ID);
        assertThat(response.status()).isEqualTo(EquipmentStatus.ACTIVE);
    }

    @Test
    void viewerCannotCreateEquipment() {
        assertThatThrownBy(() -> service.create(viewer(), validRequest("Ar Condicionado")))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void rejectsNextMaintenanceBeforeAcquisitionDate() {
        CreateEquipmentRequest request = new CreateEquipmentRequest(
                "Ar Condicionado",
                EquipmentType.CLIMATIZATION,
                "Midea",
                "Split",
                "SN-001",
                "Sala",
                EquipmentStatus.ACTIVE,
                LocalDate.now(),
                LocalDate.now().plusYears(1),
                LocalDate.now().minusDays(1),
                BigDecimal.TEN
        );

        assertThatThrownBy(() -> service.create(admin(), request))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Invalid equipment data");
    }

    @Test
    void listsOnlyCurrentCondominiumAndExcludesDeletedByDefault() {
        EquipmentResponse visible = service.create(admin(), validRequest("Gerador"));
        service.create(new RequestPrincipal(ADMIN_ID, UserRole.ADMIN, OTHER_CONDOMINIUM_ID), validRequest("Elevador"));
        service.delete(admin(), visible.id());

        PageResponse<EquipmentResponse> defaultList = service.list(admin(), null, null, null, false, 1, 20);
        PageResponse<EquipmentResponse> deletedList = service.list(admin(), null, null, null, true, 1, 20);

        assertThat(defaultList.data()).isEmpty();
        assertThat(deletedList.data()).extracting(EquipmentResponse::id).containsExactly(visible.id());
    }

    @Test
    void createsWarrantyExpiringOutboxEventWhenWarrantyChangesIntoNinetyDayWindow() {
        EquipmentResponse equipment = service.create(admin(), validRequest("Gerador"));
        outboxEventRepository.deleteAll();

        service.update(admin(), equipment.id(), new UpdateEquipmentRequest(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                LocalDate.now().plusDays(30),
                null,
                null
        ));

        assertThat(outboxEventRepository.findAll())
                .extracting(OutboxEvent::getRoutingKey)
                .contains(RoutingKeys.EQUIPMENT_WARRANTY_EXPIRING);
    }

    @Test
    void overdueMaintenanceChangesStatusAndCreatesOutboxEvent() {
        EquipmentResponse equipment = service.create(admin(), validRequest("Bomba"));
        outboxEventRepository.deleteAll();
        service.update(admin(), equipment.id(), new UpdateEquipmentRequest(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                LocalDate.now().minusDays(1),
                null
        ));

        EquipmentResponse updated = service.get(admin(), equipment.id());

        assertThat(updated.status()).isEqualTo(EquipmentStatus.ALERT);
        assertThat(outboxEventRepository.findAll())
                .extracting(OutboxEvent::getRoutingKey)
                .contains(RoutingKeys.EQUIPMENT_MAINTENANCE_DUE);
    }

    @Test
    void maintenanceCompletedUpdatesLastMaintenance() {
        EquipmentResponse equipment = service.create(admin(), validRequest("Bomba"));
        LocalDate completedDate = LocalDate.now();

        service.updateLastMaintenance(CONDOMINIUM_ID, equipment.id(), completedDate);

        assertThat(service.get(admin(), equipment.id()).lastMaintenance()).isEqualTo(completedDate);
    }

    private RequestPrincipal admin() {
        return new RequestPrincipal(ADMIN_ID, UserRole.ADMIN, CONDOMINIUM_ID);
    }

    private RequestPrincipal viewer() {
        return new RequestPrincipal(VIEWER_ID, UserRole.VIEWER, CONDOMINIUM_ID);
    }

    private CreateEquipmentRequest validRequest(String name) {
        return new CreateEquipmentRequest(
                name,
                EquipmentType.CLIMATIZATION,
                "Midea",
                "Split",
                UUID.randomUUID().toString(),
                "Sala",
                EquipmentStatus.ACTIVE,
                LocalDate.now().minusDays(10),
                LocalDate.now().plusYears(1),
                LocalDate.now().plusDays(30),
                new BigDecimal("3500.00")
        );
    }
}
