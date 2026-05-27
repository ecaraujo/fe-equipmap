package br.com.equipmap.warranty.service;

import br.com.equipmap.core.constants.RoutingKeys;
import br.com.equipmap.core.error.ForbiddenException;
import br.com.equipmap.core.error.ValidationException;
import br.com.equipmap.warranty.api.PayloadTooLargeException;
import br.com.equipmap.warranty.api.dto.*;
import br.com.equipmap.warranty.domain.*;
import br.com.equipmap.warranty.repository.OutboxEventRepository;
import br.com.equipmap.warranty.repository.WarrantyRepository;
import br.com.equipmap.warranty.security.RequestPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class WarrantyServiceTest {
    private static final UUID CONDOMINIUM_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID ADMIN_ID = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID VIEWER_ID = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    private static final UUID EQUIPMENT_ID = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");

    @Autowired
    private WarrantyService service;

    @Autowired
    private WarrantyScheduler scheduler;

    @Autowired
    private WarrantyRepository repository;

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
    void createsWarrantyWithDynamicExpiringStatus() {
        WarrantyResponse response = service.create(admin(), validCreate(LocalDate.now().plusDays(30)));

        assertThat(response.status()).isEqualTo(WarrantyStatus.EXPIRING);
        assertThat(response.equipmentId()).isEqualTo(EQUIPMENT_ID);
    }

    @Test
    void rejectsInvalidDateRange() {
        LocalDate start = LocalDate.now();
        CreateWarrantyRequest request = new CreateWarrantyRequest("Gerador", EQUIPMENT_ID, "Acme", "GT-2000", "SN-1", "Fornecedor",
                "suporte@example.com", start.minusMonths(1), start, start.minusDays(1), 12, WarrantyType.MANUFACTURER, "obs");

        assertThatThrownBy(() -> service.create(admin(), request))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void viewerCannotCreateWarranty() {
        assertThatThrownBy(() -> service.create(viewer(), validCreate(LocalDate.now().plusDays(120))))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void uploadFlowValidatesTypeSizeAndLinksDocument() {
        WarrantyResponse warranty = service.create(admin(), validCreate(LocalDate.now().plusDays(120)));

        UploadUrlResponse uploadUrl = service.uploadUrl(admin(), warranty.id(), new UploadUrlRequest("manual.pdf", "application/pdf", 1024));
        WarrantyResponse linked = service.confirmUpload(admin(), warranty.id(), new ConfirmUploadRequest(
                uploadUrl.objectKey(), "manual.pdf", "application/pdf", "application/pdf", 1024, "checksum"));

        assertThat(linked.documentObjectKey()).isEqualTo(uploadUrl.objectKey());
        assertThat(linked.documentMimeType()).isEqualTo("application/pdf");
    }

    @Test
    void rejectsInvalidMimeTypeAndTooLargeFile() {
        WarrantyResponse warranty = service.create(admin(), validCreate(LocalDate.now().plusDays(120)));

        assertThatThrownBy(() -> service.uploadUrl(admin(), warranty.id(), new UploadUrlRequest("script.exe", "application/x-msdownload", 1024)))
                .isInstanceOf(ValidationException.class);
        assertThatThrownBy(() -> service.uploadUrl(admin(), warranty.id(), new UploadUrlRequest("large.pdf", "application/pdf", 11L * 1024L * 1024L)))
                .isInstanceOf(PayloadTooLargeException.class);
    }

    @Test
    void rejectsExtensionMimeMismatch() {
        WarrantyResponse warranty = service.create(admin(), validCreate(LocalDate.now().plusDays(120)));
        UploadUrlResponse uploadUrl = service.uploadUrl(admin(), warranty.id(), new UploadUrlRequest("fake.pdf", "application/pdf", 1024));

        assertThatThrownBy(() -> service.confirmUpload(admin(), warranty.id(), new ConfirmUploadRequest(
                uploadUrl.objectKey(), "fake.pdf", "application/pdf", "image/png", 1024, "checksum")))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void dailyJobPublishesExpiringAndExpiredEventsIdempotently() {
        service.create(admin(), validCreate(LocalDate.now().plusDays(30)));
        service.create(admin(), validCreate(LocalDate.now().minusDays(2)));

        int firstRun = scheduler.publishWarrantyAlerts(LocalDate.now());
        int secondRun = scheduler.publishWarrantyAlerts(LocalDate.now());

        assertThat(firstRun).isEqualTo(2);
        assertThat(secondRun).isZero();
        assertThat(outboxRepository.findAll()).extracting(OutboxEvent::getRoutingKey)
                .containsExactlyInAnyOrder(RoutingKeys.WARRANTY_EXPIRING, RoutingKeys.WARRANTY_EXPIRED);
    }

    private RequestPrincipal admin() {
        return new RequestPrincipal(ADMIN_ID, UserRole.ADMIN, CONDOMINIUM_ID);
    }

    private RequestPrincipal viewer() {
        return new RequestPrincipal(VIEWER_ID, UserRole.VIEWER, CONDOMINIUM_ID);
    }

    private CreateWarrantyRequest validCreate(LocalDate warrantyEnd) {
        LocalDate start = warrantyEnd.isBefore(LocalDate.now()) ? warrantyEnd.minusMonths(12) : LocalDate.now();
        return new CreateWarrantyRequest("Gerador", EQUIPMENT_ID, "Acme", "GT-2000", "SN-1", "Fornecedor",
                "suporte@example.com", start.minusMonths(1), start, warrantyEnd, 12, WarrantyType.MANUFACTURER, "obs");
    }
}
