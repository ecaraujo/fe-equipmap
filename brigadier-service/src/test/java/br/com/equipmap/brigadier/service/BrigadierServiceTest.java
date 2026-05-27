package br.com.equipmap.brigadier.service;

import br.com.equipmap.brigadier.api.dto.*;
import br.com.equipmap.brigadier.domain.*;
import br.com.equipmap.brigadier.repository.BrigadierRepository;
import br.com.equipmap.brigadier.repository.NotificationLogRepository;
import br.com.equipmap.brigadier.security.RequestPrincipal;
import br.com.equipmap.core.error.ForbiddenException;
import br.com.equipmap.core.error.ValidationException;
import br.com.equipmap.core.messaging.MessageChannel;
import br.com.equipmap.core.messaging.MessagingProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.LocalDate;
import java.util.List;
import java.util.function.Supplier;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
class BrigadierServiceTest {
    private static final UUID CONDOMINIUM_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID ADMIN_ID = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID VIEWER_ID = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

    @Autowired
    private BrigadierService service;

    @Autowired
    private BrigadierNotificationWorker worker;

    @Autowired
    private BrigadierRepository brigadierRepository;

    @Autowired
    private NotificationLogRepository logRepository;

    @MockitoBean
    private RabbitTemplate rabbitTemplate;

    @BeforeEach
    void cleanDatabase() {
        logRepository.deleteAll();
        brigadierRepository.deleteAll();
    }

    @Test
    void createsAndFiltersBrigadierWithDynamicStatus() {
        BrigadierResponse expiring = service.create(admin(), validCreate("Ana", BrigadierRole.CHIEF, true, LocalDate.now().plusDays(45), "11999999999"));
        service.create(admin(), validCreate("Bia", BrigadierRole.MEMBER, true, LocalDate.now().plusDays(200), "11888888888"));

        List<BrigadierResponse> chiefs = service.list(admin(), null, BrigadierRole.CHIEF, CertificationStatus.EXPIRING);

        assertThat(expiring.certificationStatus()).isEqualTo(CertificationStatus.EXPIRING);
        assertThat(chiefs).extracting(BrigadierResponse::id).containsExactly(expiring.id());
    }

    @Test
    void viewerCannotCreate() {
        assertThatThrownBy(() -> service.create(viewer(), validCreate("Ana", BrigadierRole.CHIEF, true, LocalDate.now().plusDays(45), "11999999999")))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void rejectsInvalidCertificationRange() {
        assertThatThrownBy(() -> service.create(admin(), validCreate("Ana", BrigadierRole.CHIEF, true, LocalDate.now().minusDays(1), "11999999999")))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void notifyEnqueuesOnlyActiveRecipients() {
        BrigadierResponse active = service.create(admin(), validCreate("Ana", BrigadierRole.CHIEF, true, LocalDate.now().plusDays(200), "11999999999"));
        BrigadierResponse inactive = service.create(admin(), validCreate("Bia", BrigadierRole.MEMBER, false, LocalDate.now().plusDays(200), "11888888888"));

        NotifyBrigadiersResponse response = service.notify(admin(), new NotifyBrigadiersRequest("Teste de alarme", List.of(active.id(), inactive.id()), MessageChannel.WHATSAPP));

        assertThat(response.enqueued()).isEqualTo(1);
        assertThat(response.skippedInactive()).containsExactly(inactive.id());
        assertThat(service.logs(admin())).hasSize(1);
        verify(rabbitTemplate, times(1)).convertAndSend(eq("equipmap.brigadier"), eq("brigadier.notification.requested"), any(QueuedNotificationMessage.class));
    }

    @Test
    void notifyRejectsEmptyMessageAndNoActiveRecipients() {
        BrigadierResponse inactive = service.create(admin(), validCreate("Bia", BrigadierRole.MEMBER, false, LocalDate.now().plusDays(200), "11888888888"));

        assertThatThrownBy(() -> service.notify(admin(), new NotifyBrigadiersRequest(" ", List.of(inactive.id()), MessageChannel.SMS)))
                .isInstanceOf(ValidationException.class);
        assertThatThrownBy(() -> service.notify(admin(), new NotifyBrigadiersRequest("Mensagem", List.of(inactive.id()), MessageChannel.SMS)))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void workerCreatesSentAndFailedLogsUsingSandboxProvider() {
        BrigadierResponse sent = service.create(admin(), validCreate("Ana", BrigadierRole.CHIEF, true, LocalDate.now().plusDays(200), "11999999999"));
        BrigadierResponse failed = service.create(admin(), validCreate("Bia", BrigadierRole.MEMBER, true, LocalDate.now().plusDays(200), "11000000000"));
        service.notify(admin(), new NotifyBrigadiersRequest("Mensagem", List.of(sent.id(), failed.id()), MessageChannel.WHATSAPP));

        for (NotificationLogResponse log : service.logs(admin())) {
            worker.process(new QueuedNotificationMessage(log.id()));
        }

        assertThat(service.logs(admin())).extracting(NotificationLogResponse::status)
                .containsExactlyInAnyOrder(NotificationStatus.SENT, NotificationStatus.FAILED);
    }

    @Test
    @SuppressWarnings("unchecked")
    void workerFailsClearlyWithoutMessagingProvider() {
        ObjectProvider<MessagingProvider> emptyProvider = mock(ObjectProvider.class);
        when(emptyProvider.getIfAvailable(any())).thenAnswer(invocation -> {
            Supplier<MessagingProvider> fallback = invocation.getArgument(0);
            return fallback.get();
        });

        assertThatThrownBy(() -> new BrigadierNotificationWorker(logRepository, emptyProvider))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("No MessagingProvider configured");
    }

    private RequestPrincipal admin() {
        return new RequestPrincipal(ADMIN_ID, UserRole.ADMIN, CONDOMINIUM_ID);
    }

    private RequestPrincipal viewer() {
        return new RequestPrincipal(VIEWER_ID, UserRole.VIEWER, CONDOMINIUM_ID);
    }

    private CreateBrigadierRequest validCreate(String name, BrigadierRole role, boolean active, LocalDate expiry, String phone) {
        LocalDate date = LocalDate.now();
        return new CreateBrigadierRequest(name, role, phone, name.toLowerCase() + "@example.com", active, date, expiry, null);
    }
}
