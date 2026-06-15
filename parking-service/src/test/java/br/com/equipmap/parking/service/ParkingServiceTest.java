package br.com.equipmap.parking.service;

import br.com.equipmap.core.error.ForbiddenException;
import br.com.equipmap.core.error.ValidationException;
import br.com.equipmap.parking.api.dto.*;
import br.com.equipmap.parking.domain.ParkingSpotType;
import br.com.equipmap.parking.domain.UserRole;
import br.com.equipmap.parking.repository.ApartmentRepository;
import br.com.equipmap.parking.repository.LotterySessionRepository;
import br.com.equipmap.parking.repository.ParkingSpotRepository;
import br.com.equipmap.parking.security.RequestPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class ParkingServiceTest {
    private static final UUID CONDOMINIUM_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID ADMIN_ID = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID MANAGER_ID = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    private static final UUID VIEWER_ID = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");

    @Autowired
    private ParkingService service;

    @Autowired
    private ApartmentRepository apartmentRepository;

    @Autowired
    private ParkingSpotRepository spotRepository;

    @Autowired
    private LotterySessionRepository sessionRepository;

    @BeforeEach
    void cleanDatabase() {
        sessionRepository.deleteAll();
        spotRepository.deleteAll();
        apartmentRepository.deleteAll();
    }

    @Test
    void createsAndListsApartmentsAndSpots() {
        ApartmentResponse apartment = service.createApartment(admin(), apartmentRequest("101", "A", "Ana", true));
        ParkingSpotResponse spot = service.createSpot(admin(), new CreateParkingSpotRequest("G1", ParkingSpotType.CAR));

        assertThat(service.listApartments(admin())).extracting(ApartmentResponse::id).containsExactly(apartment.id());
        assertThat(apartment.ownerName()).isEqualTo("Ana");
        assertThat(apartment.owner()).isEqualTo("Ana");
        assertThat(apartment.ownerPhone()).isEqualTo("11999999999");
        assertThat(service.listSpots(admin())).extracting(ParkingSpotResponse::id).containsExactly(spot.id());
    }

    @Test
    void viewerCannotWrite() {
        assertThatThrownBy(() -> service.createApartment(viewer(), apartmentRequest("101", "A", "Ana", true)))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void validatesOwnerContactAndRentedTenantData() {
        CreateApartmentRequest missingOwnerContact = new CreateApartmentRequest("101", "A", null, "Ana", "Ana",
                null, null, null, false, null, null, null, null, null, null, true, null);
        CreateApartmentRequest missingTenantContact = new CreateApartmentRequest("102", "A", null, "Bruno", "Bruno",
                null, "11999999999", null, true, "Carlos", null, null, null,
                LocalDate.now(), LocalDate.now().plusMonths(1), true, null);

        assertThatThrownBy(() -> service.createApartment(admin(), missingOwnerContact))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Apartment validation failed");
        assertThatThrownBy(() -> service.createApartment(admin(), missingTenantContact))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Apartment validation failed");
    }

    @Test
    void validatesDuplicateActiveApartmentPerCondominium() {
        service.createApartment(admin(), apartmentRequest("101", "A", "Ana", true));

        assertThatThrownBy(() -> service.createApartment(admin(), apartmentRequest("101", "A", "Outra", true)))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Apartment validation failed");

        ApartmentResponse otherCondominium = service.createApartment(otherCondominiumAdmin(), apartmentRequest("101", "A", "Outra", true));
        assertThat(otherCondominium.condominiumId()).isEqualTo(otherCondominiumAdmin().condominiumId());
    }

    @Test
    void updatesAndSoftDeletesApartments() {
        ApartmentResponse created = service.createApartment(admin(), apartmentRequest("101", "A", "Ana", true));

        ApartmentResponse updated = service.updateApartment(admin(), created.id(), new UpdateApartmentRequest(
                "202", "B", 12, "Beatriz", "Beatriz", "12345678900", "(11) 98888-7777",
                "beatriz@example.com", true, "Carlos", "98765432100", "11977776666",
                "carlos@example.com", LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31),
                false, "Unidade alugada"));

        assertThat(updated.unit()).isEqualTo("202");
        assertThat(updated.block()).isEqualTo("B");
        assertThat(updated.floor()).isEqualTo(12);
        assertThat(updated.ownerName()).isEqualTo("Beatriz");
        assertThat(updated.ownerPhone()).isEqualTo("11988887777");
        assertThat(updated.isRented()).isTrue();
        assertThat(updated.tenantName()).isEqualTo("Carlos");
        assertThat(updated.hasVehicle()).isFalse();

        service.deleteApartment(admin(), created.id());
        assertThat(service.listApartments(admin())).isEmpty();
        assertThat(service.createApartment(admin(), apartmentRequest("202", "B", "Novo", true)).id()).isNotNull();
    }

    @Test
    void lotteryIsReproducibleWithSameSeedAfterReset() {
        seedApartments(4, true);
        seedSpots(4);

        LotterySessionResponse first = service.executeLottery(admin(), new ExecuteLotteryRequest(42L));
        service.resetLottery(admin());
        LotterySessionResponse second = service.executeLottery(admin(), new ExecuteLotteryRequest(42L));

        assertThat(pairs(first)).isEqualTo(pairs(second));
        assertThat(first.seed()).isEqualTo(42L);
    }

    @Test
    void lotteryIgnoresApartmentsWithoutVehicleAndRecordsUndrawnApartments() {
        seedApartments(3, true);
        service.createApartment(admin(), apartmentRequest("999", "Z", "Sem carro", false));
        seedSpots(2);

        LotterySessionResponse response = service.executeLottery(admin(), new ExecuteLotteryRequest(7L));

        assertThat(response.results()).hasSize(2);
        assertThat(response.undrawnApartments()).contains("unit");
        assertThat(response.undrawnApartments()).doesNotContain("999");
    }

    @Test
    void lotteryValidatesEligibleApartmentsAndSpots() {
        service.createApartment(admin(), apartmentRequest("101", "A", "Ana", false));
        service.createSpot(admin(), new CreateParkingSpotRequest("G1", ParkingSpotType.CAR));

        assertThatThrownBy(() -> service.executeLottery(admin(), new ExecuteLotteryRequest(1L)))
                .isInstanceOf(ValidationException.class);

        cleanDatabase();
        service.createApartment(admin(), apartmentRequest("101", "A", "Ana", true));
        assertThatThrownBy(() -> service.executeLottery(admin(), new ExecuteLotteryRequest(1L)))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void resetLotteryIsAdminOnly() {
        seedApartments(1, true);
        seedSpots(1);
        service.executeLottery(admin(), new ExecuteLotteryRequest(99L));

        assertThatThrownBy(() -> service.resetLottery(manager()))
                .isInstanceOf(ForbiddenException.class);

        service.resetLottery(admin());
        assertThat(service.listLotterySessions(admin())).isEmpty();
    }

    @Test
    void alreadyDrawnApartmentsDoNotParticipateUntilReset() {
        seedApartments(2, true);
        seedSpots(2);

        LotterySessionResponse first = service.executeLottery(admin(), new ExecuteLotteryRequest(10L));
        assertThat(first.results()).hasSize(2);
        assertThatThrownBy(() -> service.executeLottery(admin(), new ExecuteLotteryRequest(11L)))
                .isInstanceOf(ValidationException.class);
    }

    private List<String> pairs(LotterySessionResponse response) {
        return response.results().stream()
                .map(result -> result.unit() + "->" + result.spotNumber())
                .toList();
    }

    private void seedApartments(int count, boolean hasVehicle) {
        for (int i = 1; i <= count; i++) {
            service.createApartment(admin(), apartmentRequest("10" + i, "A", "Owner " + i, hasVehicle));
        }
    }

    private CreateApartmentRequest apartmentRequest(String unit, String block, String ownerName, boolean hasVehicle) {
        return new CreateApartmentRequest(unit, block, null, ownerName, ownerName, null,
                "11999999999", null, false, null, null, null, null, null, null, hasVehicle, null);
    }

    private void seedSpots(int count) {
        for (int i = 1; i <= count; i++) {
            service.createSpot(admin(), new CreateParkingSpotRequest("G" + i, ParkingSpotType.CAR));
        }
    }

    private RequestPrincipal admin() {
        return new RequestPrincipal(ADMIN_ID, UserRole.ADMIN, CONDOMINIUM_ID);
    }

    private RequestPrincipal manager() {
        return new RequestPrincipal(MANAGER_ID, UserRole.MANAGER, CONDOMINIUM_ID);
    }

    private RequestPrincipal viewer() {
        return new RequestPrincipal(VIEWER_ID, UserRole.VIEWER, CONDOMINIUM_ID);
    }

    private RequestPrincipal otherCondominiumAdmin() {
        return new RequestPrincipal(ADMIN_ID, UserRole.ADMIN, UUID.fromString("22222222-2222-2222-2222-222222222222"));
    }
}
