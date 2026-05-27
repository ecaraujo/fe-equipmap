package br.com.equipmap.parking.service;

import br.com.equipmap.core.error.ErrorDetail;
import br.com.equipmap.core.error.ForbiddenException;
import br.com.equipmap.core.error.NotFoundException;
import br.com.equipmap.core.error.ValidationException;
import br.com.equipmap.parking.api.dto.*;
import br.com.equipmap.parking.domain.Apartment;
import br.com.equipmap.parking.domain.LotteryResult;
import br.com.equipmap.parking.domain.LotterySession;
import br.com.equipmap.parking.domain.ParkingSpot;
import br.com.equipmap.parking.repository.ApartmentRepository;
import br.com.equipmap.parking.repository.LotteryResultRepository;
import br.com.equipmap.parking.repository.LotterySessionRepository;
import br.com.equipmap.parking.repository.ParkingSpotRepository;
import br.com.equipmap.parking.security.RequestPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class ParkingService {
    private final ApartmentRepository apartmentRepository;
    private final ParkingSpotRepository spotRepository;
    private final LotterySessionRepository sessionRepository;
    private final LotteryResultRepository resultRepository;

    public ParkingService(ApartmentRepository apartmentRepository, ParkingSpotRepository spotRepository,
                          LotterySessionRepository sessionRepository, LotteryResultRepository resultRepository) {
        this.apartmentRepository = apartmentRepository;
        this.spotRepository = spotRepository;
        this.sessionRepository = sessionRepository;
        this.resultRepository = resultRepository;
    }

    @Transactional(readOnly = true)
    public List<ApartmentResponse> listApartments(RequestPrincipal principal) {
        return apartmentRepository.findByCondominiumIdAndDeletedAtIsNullOrderByBlockAscUnitAsc(principal.condominiumId())
                .stream().map(ApartmentResponse::from).toList();
    }

    @Transactional
    public ApartmentResponse createApartment(RequestPrincipal principal, CreateApartmentRequest request) {
        requireWrite(principal);
        return ApartmentResponse.from(apartmentRepository.save(new Apartment(principal.condominiumId(), request.unit(), request.block(), request.owner(), request.hasVehicle())));
    }

    @Transactional
    public ApartmentResponse updateApartment(RequestPrincipal principal, UUID id, UpdateApartmentRequest request) {
        requireWrite(principal);
        Apartment apartment = findApartment(principal, id);
        apartment.update(request.unit(), request.block(), request.owner(), request.hasVehicle());
        return ApartmentResponse.from(apartment);
    }

    @Transactional
    public void deleteApartment(RequestPrincipal principal, UUID id) {
        requireWrite(principal);
        findApartment(principal, id).delete();
    }

    @Transactional(readOnly = true)
    public List<ParkingSpotResponse> listSpots(RequestPrincipal principal) {
        return spotRepository.findByCondominiumIdAndDeletedAtIsNullOrderByNumberAsc(principal.condominiumId())
                .stream().map(ParkingSpotResponse::from).toList();
    }

    @Transactional
    public ParkingSpotResponse createSpot(RequestPrincipal principal, CreateParkingSpotRequest request) {
        requireWrite(principal);
        return ParkingSpotResponse.from(spotRepository.save(new ParkingSpot(principal.condominiumId(), request.number(), request.type())));
    }

    @Transactional
    public ParkingSpotResponse updateSpot(RequestPrincipal principal, UUID id, UpdateParkingSpotRequest request) {
        requireWrite(principal);
        ParkingSpot spot = findSpot(principal, id);
        spot.update(request.number(), request.type());
        return ParkingSpotResponse.from(spot);
    }

    @Transactional
    public void deleteSpot(RequestPrincipal principal, UUID id) {
        requireWrite(principal);
        findSpot(principal, id).delete();
    }

    @Transactional(readOnly = true)
    public List<LotterySessionResponse> listLotterySessions(RequestPrincipal principal) {
        return sessionRepository.findByCondominiumIdOrderByDrawnAtDesc(principal.condominiumId())
                .stream().map(LotterySessionResponse::from).toList();
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public LotterySessionResponse executeLottery(RequestPrincipal principal, ExecuteLotteryRequest request) {
        requireWrite(principal);
        List<Apartment> apartments = apartmentRepository.findActiveForUpdate(principal.condominiumId());
        List<ParkingSpot> spots = spotRepository.findActiveForUpdate(principal.condominiumId());
        Set<UUID> drawnApartments = resultRepository.findDrawnApartmentIds(principal.condominiumId());
        Set<UUID> drawnSpots = resultRepository.findDrawnSpotIds(principal.condominiumId());

        List<Apartment> eligibleApartments = apartments.stream()
                .filter(Apartment::isHasVehicle)
                .filter(apartment -> !drawnApartments.contains(apartment.getId()))
                .toList();
        List<ParkingSpot> availableSpots = spots.stream()
                .filter(spot -> !drawnSpots.contains(spot.getId()))
                .toList();

        if (eligibleApartments.isEmpty()) {
            throw new ValidationException("No eligible apartments for lottery", List.of(new ErrorDetail("apartments", "eligible apartments must be greater than zero")));
        }
        if (availableSpots.isEmpty()) {
            throw new ValidationException("No parking spots available for lottery", List.of(new ErrorDetail("spots", "available spots must be greater than zero")));
        }

        long seed = request.seed() == null ? System.currentTimeMillis() : request.seed();
        List<Apartment> shuffledApartments = new ArrayList<>(eligibleApartments);
        List<ParkingSpot> shuffledSpots = new ArrayList<>(availableSpots);
        fisherYates(shuffledApartments, new Random(seed));
        fisherYates(shuffledSpots, new Random(seed ^ 0x5DEECE66DL));

        int drawCount = Math.min(shuffledApartments.size(), shuffledSpots.size());
        List<Apartment> undrawn = shuffledApartments.subList(drawCount, shuffledApartments.size());
        LotterySession session = new LotterySession(principal.condominiumId(), seed, undrawnApartmentsJson(undrawn));
        Instant drawnAt = Instant.now();
        for (int i = 0; i < drawCount; i++) {
            session.addResult(new LotteryResult(principal.condominiumId(), shuffledApartments.get(i), shuffledSpots.get(i), seed, drawnAt));
        }
        return LotterySessionResponse.from(sessionRepository.save(session));
    }

    @Transactional
    public void resetLottery(RequestPrincipal principal) {
        if (!principal.isAdmin()) throw new ForbiddenException("Only admin can reset parking lottery");
        sessionRepository.deleteByCondominiumId(principal.condominiumId());
    }

    private Apartment findApartment(RequestPrincipal principal, UUID id) {
        return apartmentRepository.findByIdAndCondominiumIdAndDeletedAtIsNull(id, principal.condominiumId())
                .orElseThrow(() -> new NotFoundException("Apartment not found"));
    }

    private ParkingSpot findSpot(RequestPrincipal principal, UUID id) {
        return spotRepository.findByIdAndCondominiumIdAndDeletedAtIsNull(id, principal.condominiumId())
                .orElseThrow(() -> new NotFoundException("Parking spot not found"));
    }

    private void requireWrite(RequestPrincipal principal) {
        if (!principal.canWrite()) throw new ForbiddenException("User does not have permission to modify parking data");
    }

    private <T> void fisherYates(List<T> values, Random random) {
        for (int i = values.size() - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            Collections.swap(values, i, j);
        }
    }

    private String undrawnApartmentsJson(List<Apartment> apartments) {
        StringJoiner joiner = new StringJoiner(",", "[", "]");
        for (Apartment apartment : apartments) {
            joiner.add("{\"id\":\"%s\",\"unit\":\"%s\",\"block\":\"%s\",\"owner\":\"%s\"}"
                    .formatted(apartment.getId(), escape(apartment.getUnit()), escape(apartment.getBlock()), escape(apartment.getOwner())));
        }
        return joiner.toString();
    }

    private String escape(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
