package br.com.equipmap.condominium.service;

import br.com.equipmap.condominium.api.dto.AddUserRequest;
import br.com.equipmap.condominium.api.dto.CondominiumResponse;
import br.com.equipmap.condominium.api.dto.CreateCondominiumRequest;
import br.com.equipmap.condominium.domain.UserRole;
import br.com.equipmap.condominium.repository.CondominiumRepository;
import br.com.equipmap.condominium.repository.CondominiumUserRepository;
import br.com.equipmap.condominium.security.RequestPrincipal;
import br.com.equipmap.core.error.ConflictException;
import br.com.equipmap.core.error.ForbiddenException;
import br.com.equipmap.core.error.ValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class CondominiumServiceTest {
    private static final UUID ADMIN_ID = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID MANAGER_ID = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    private static final UUID VIEWER_ID = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
    private static final UUID ACTIVE_CONDOMINIUM_ID = UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd");

    @Autowired
    private CondominiumService service;

    @Autowired
    private CondominiumRepository condominiumRepository;

    @Autowired
    private CondominiumUserRepository condominiumUserRepository;

    @BeforeEach
    void cleanDatabase() {
        condominiumUserRepository.deleteAll();
        condominiumRepository.deleteAll();
    }

    @Test
    void adminCreatesCondominiumWithNormalizedCnpjAndDefaultTimezone() {
        CondominiumResponse response = service.create(admin(), createRequest("Residencial Alpha", "12.345.678/0001-95"));

        assertThat(response.name()).isEqualTo("Residencial Alpha");
        assertThat(response.cnpj()).isEqualTo("12345678000195");
        assertThat(response.timezone()).isEqualTo("America/Sao_Paulo");
    }

    @Test
    void duplicateCnpjIsRejected() {
        service.create(admin(), createRequest("Residencial Alpha", "12.345.678/0001-95"));

        assertThatThrownBy(() -> service.create(admin(), createRequest("Residencial Beta", "12345678000195")))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void managerCannotCreateCondominium() {
        assertThatThrownBy(() -> service.create(manager(), createRequest("Residencial Alpha", "12.345.678/0001-95")))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void invalidTimezoneIsRejected() {
        CreateCondominiumRequest request = new CreateCondominiumRequest(
                "Residencial Alpha",
                "12.345.678/0001-95",
                "Rua Um, 100",
                "Sao_Paulo"
        );

        assertThatThrownBy(() -> service.create(admin(), request))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Invalid timezone");
    }

    @Test
    void nonAdminListsOnlyAssociatedCondominiums() {
        CondominiumResponse alpha = service.create(admin(), createRequest("Residencial Alpha", "12.345.678/0001-95"));
        service.create(admin(), createRequest("Residencial Beta", "98.765.432/0001-10"));
        service.addUser(admin(), alpha.id(), new AddUserRequest(VIEWER_ID, "viewer@example.com", "Viewer", UserRole.VIEWER));

        List<CondominiumResponse> visible = service.list(viewer(alpha.id()));

        assertThat(visible).extracting(CondominiumResponse::id).containsExactly(alpha.id());
    }

    @Test
    void duplicateActiveAssociationIsRejected() {
        CondominiumResponse condominium = service.create(admin(), createRequest("Residencial Alpha", "12.345.678/0001-95"));
        AddUserRequest request = new AddUserRequest(MANAGER_ID, "manager@example.com", "Manager", UserRole.MANAGER);
        service.addUser(admin(), condominium.id(), request);

        assertThatThrownBy(() -> service.addUser(admin(), condominium.id(), request))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void removingLastAdminIsRejected() {
        CondominiumResponse condominium = service.create(admin(), createRequest("Residencial Alpha", "12.345.678/0001-95"));
        service.addUser(admin(), condominium.id(), new AddUserRequest(ADMIN_ID, "admin@example.com", "Admin", UserRole.ADMIN));

        assertThatThrownBy(() -> service.removeUser(admin(), condominium.id(), ADMIN_ID))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("last condominium admin");
    }

    private RequestPrincipal admin() {
        return new RequestPrincipal(ADMIN_ID, UserRole.ADMIN, ACTIVE_CONDOMINIUM_ID);
    }

    private RequestPrincipal manager() {
        return new RequestPrincipal(MANAGER_ID, UserRole.MANAGER, ACTIVE_CONDOMINIUM_ID);
    }

    private RequestPrincipal viewer(UUID condominiumId) {
        return new RequestPrincipal(VIEWER_ID, UserRole.VIEWER, condominiumId);
    }

    private CreateCondominiumRequest createRequest(String name, String cnpj) {
        return new CreateCondominiumRequest(name, cnpj, "Rua Um, 100", null);
    }
}
