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
        ApartmentResponse apartment = service.createApartment(admin(), new CreateApartmentRequest("101", "A", "Ana", true));
        ParkingSpotResponse spot = service.createSpot(admin(), new CreateParkingSpotRequest("G1", ParkingSpotType.CAR));

        assertThat(service.listApartments(admin())).extracting(ApartmentResponse::id).containsExactly(apartment.id());
        assertThat(service.listSpots(admin())).extracting(ParkingSpotResponse::id).containsExactly(spot.id());
    }

    @Test
    void viewerCannotWrite() {
        assertThatThrownBy(() -> service.createApartment(viewer(), new CreateApartmentRequest("101", "A", "Ana", true)))
                .isInstanceOf(ForbiddenException.class);
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
        service.createApartment(admin(), new CreateApartmentRequest("999", "Z", "Sem carro", false));
        seedSpots(2);

        LotterySessionResponse response = service.executeLottery(admin(), new ExecuteLotteryRequest(7L));

        assertThat(response.results()).hasSize(2);
        assertThat(response.undrawnApartments()).contains("unit");
        assertThat(response.undrawnApartments()).doesNotContain("999");
    }

    @Test
    void lotteryValidatesEligibleApartmentsAndSpots() {
        service.createApartment(admin(), new CreateApartmentRequest("101", "A", "Ana", false));
        service.createSpot(admin(), new CreateParkingSpotRequest("G1", ParkingSpotType.CAR));

        assertThatThrownBy(() -> service.executeLottery(admin(), new ExecuteLotteryRequest(1L)))
                .isInstanceOf(ValidationException.class);

        cleanDatabase();
        service.createApartment(admin(), new CreateApartmentRequest("101", "A", "Ana", true));
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
            service.createApartment(admin(), new CreateApartmentRequest("10" + i, "A", "Owner " + i, hasVehicle));
        }
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
}
