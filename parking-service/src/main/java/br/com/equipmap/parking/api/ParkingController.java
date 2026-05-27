package br.com.equipmap.parking.api;

import br.com.equipmap.parking.api.dto.*;
import br.com.equipmap.parking.security.PrincipalResolver;
import br.com.equipmap.parking.security.RequestPrincipal;
import br.com.equipmap.parking.service.ParkingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Parking")
@RestController
@RequestMapping("/parking")
public class ParkingController {
    private final ParkingService service;
    private final PrincipalResolver principalResolver;

    public ParkingController(ParkingService service, PrincipalResolver principalResolver) {
        this.service = service;
        this.principalResolver = principalResolver;
    }

    @Operation(summary = "List apartments")
    @GetMapping("/apartments")
    public List<ApartmentResponse> listApartments(HttpServletRequest request) {
        return service.listApartments(principal(request));
    }

    @Operation(summary = "Create apartment")
    @PostMapping("/apartments")
    @ResponseStatus(HttpStatus.CREATED)
    public ApartmentResponse createApartment(HttpServletRequest request, @Valid @RequestBody CreateApartmentRequest body) {
        return service.createApartment(principal(request), body);
    }

    @Operation(summary = "Update apartment")
    @PutMapping("/apartments/{id}")
    public ApartmentResponse updateApartment(HttpServletRequest request, @PathVariable UUID id, @Valid @RequestBody UpdateApartmentRequest body) {
        return service.updateApartment(principal(request), id, body);
    }

    @Operation(summary = "Soft delete apartment")
    @DeleteMapping("/apartments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteApartment(HttpServletRequest request, @PathVariable UUID id) {
        service.deleteApartment(principal(request), id);
    }

    @Operation(summary = "List parking spots")
    @GetMapping("/spots")
    public List<ParkingSpotResponse> listSpots(HttpServletRequest request) {
        return service.listSpots(principal(request));
    }

    @Operation(summary = "Create parking spot")
    @PostMapping("/spots")
    @ResponseStatus(HttpStatus.CREATED)
    public ParkingSpotResponse createSpot(HttpServletRequest request, @Valid @RequestBody CreateParkingSpotRequest body) {
        return service.createSpot(principal(request), body);
    }

    @Operation(summary = "Update parking spot")
    @PutMapping("/spots/{id}")
    public ParkingSpotResponse updateSpot(HttpServletRequest request, @PathVariable UUID id, @Valid @RequestBody UpdateParkingSpotRequest body) {
        return service.updateSpot(principal(request), id, body);
    }

    @Operation(summary = "Soft delete parking spot")
    @DeleteMapping("/spots/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSpot(HttpServletRequest request, @PathVariable UUID id) {
        service.deleteSpot(principal(request), id);
    }

    @Operation(summary = "List lottery sessions")
    @GetMapping("/lottery")
    public List<LotterySessionResponse> listLottery(HttpServletRequest request) {
        return service.listLotterySessions(principal(request));
    }

    @Operation(summary = "Execute auditable parking lottery")
    @PostMapping("/lottery")
    @ResponseStatus(HttpStatus.CREATED)
    public LotterySessionResponse executeLottery(HttpServletRequest request, @RequestBody(required = false) ExecuteLotteryRequest body) {
        return service.executeLottery(principal(request), body == null ? new ExecuteLotteryRequest(null) : body);
    }

    @Operation(summary = "Reset lottery results, admin only")
    @DeleteMapping("/lottery")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetLottery(HttpServletRequest request) {
        service.resetLottery(principal(request));
    }

    private RequestPrincipal principal(HttpServletRequest request) {
        return principalResolver.resolve(request);
    }
}
