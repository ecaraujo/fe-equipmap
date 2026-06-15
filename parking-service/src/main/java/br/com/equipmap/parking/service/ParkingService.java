package br.com.equipmap.parking.service;

import br.com.equipmap.core.error.ErrorDetail;
import br.com.equipmap.core.error.ForbiddenException;
import br.com.equipmap.core.error.NotFoundException;
import br.com.equipmap.core.error.ValidationException;
import br.com.equipmap.parking.api.dto.*;
import br.com.equipmap.parking.domain.Apartment;
import br.com.equipmap.parking.domain.ApartmentDetails;
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
import java.time.LocalDate;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class ParkingService {
    private static final Pattern NON_DIGITS = Pattern.compile("\\D");

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
        ApartmentDetails details = validateCreateApartment(principal, request);
        return ApartmentResponse.from(apartmentRepository.save(new Apartment(principal.condominiumId(), details)));
    }

    @Transactional
    public ApartmentResponse updateApartment(RequestPrincipal principal, UUID id, UpdateApartmentRequest request) {
        requireWrite(principal);
        Apartment apartment = findApartment(principal, id);
        apartment.update(validateUpdateApartment(principal, apartment, request));
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

    private ApartmentDetails validateCreateApartment(RequestPrincipal principal, CreateApartmentRequest request) {
        List<ErrorDetail> details = new ArrayList<>();
        String unit = required("unit", request.unit(), details);
        String block = required("block", request.block(), details);
        String ownerName = required("ownerName", firstNonBlank(request.ownerName(), request.owner()), details);
        String ownerPhone = normalizePhone("ownerPhone", request.ownerPhone(), details);
        String tenantPhone = normalizePhone("tenantPhone", request.tenantPhone(), details);
        ApartmentDetails apartmentDetails = validateApartmentDetails(new ApartmentDetails(
                unit,
                block,
                request.floor(),
                ownerName,
                clean(request.ownerDocument()),
                ownerPhone,
                clean(request.ownerEmail()),
                request.isRented(),
                clean(request.tenantName()),
                clean(request.tenantDocument()),
                tenantPhone,
                clean(request.tenantEmail()),
                request.rentalStart(),
                request.rentalEnd(),
                request.hasVehicle(),
                clean(request.observations())), details);
        validateActiveApartmentUniqueness(principal.condominiumId(), unit, block, null, details);
        throwIfInvalid(details);
        return apartmentDetails;
    }

    private ApartmentDetails validateUpdateApartment(RequestPrincipal principal, Apartment apartment, UpdateApartmentRequest request) {
        List<ErrorDetail> details = new ArrayList<>();
        String unit = required("unit", valueOrCurrent(request.unit(), apartment.getUnit()), details);
        String block = required("block", valueOrCurrent(request.block(), apartment.getBlock()), details);
        String ownerName = required("ownerName", firstNonBlank(request.ownerName(), request.owner(), apartment.getOwnerName()), details);
        String ownerPhone = normalizePhone("ownerPhone", valueOrCurrent(request.ownerPhone(), apartment.getOwnerPhone()), details);
        String tenantPhone = normalizePhone("tenantPhone", valueOrCurrent(request.tenantPhone(), apartment.getTenantPhone()), details);
        boolean rented = request.isRented() == null ? apartment.isRented() : request.isRented();
        ApartmentDetails apartmentDetails = validateApartmentDetails(new ApartmentDetails(
                unit,
                block,
                request.floor() == null ? apartment.getFloor() : request.floor(),
                ownerName,
                valueOrCurrent(request.ownerDocument(), apartment.getOwnerDocument()),
                ownerPhone,
                valueOrCurrent(request.ownerEmail(), apartment.getOwnerEmail()),
                rented,
                valueOrCurrent(request.tenantName(), apartment.getTenantName()),
                valueOrCurrent(request.tenantDocument(), apartment.getTenantDocument()),
                tenantPhone,
                valueOrCurrent(request.tenantEmail(), apartment.getTenantEmail()),
                request.rentalStart() == null ? apartment.getRentalStart() : request.rentalStart(),
                request.rentalEnd() == null ? apartment.getRentalEnd() : request.rentalEnd(),
                request.hasVehicle() == null ? apartment.isHasVehicle() : request.hasVehicle(),
                valueOrCurrent(request.observations(), apartment.getObservations())), details);
        validateActiveApartmentUniqueness(principal.condominiumId(), unit, block, apartment.getId(), details);
        throwIfInvalid(details);
        return apartmentDetails;
    }

    private ApartmentDetails validateApartmentDetails(ApartmentDetails apartment, List<ErrorDetail> details) {
        String tenantName = apartment.tenantName();
        String tenantDocument = apartment.tenantDocument();
        String tenantPhone = apartment.tenantPhone();
        String tenantEmail = apartment.tenantEmail();
        LocalDate rentalStart = apartment.rentalStart();
        LocalDate rentalEnd = apartment.rentalEnd();
        if (apartment.ownerPhone() == null && isBlank(apartment.ownerEmail())) {
            details.add(new ErrorDetail("ownerContact", "ownerPhone or ownerEmail is required"));
        }
        if (apartment.rented()) {
            if (isBlank(tenantName)) {
                details.add(new ErrorDetail("tenantName", "tenantName is required when apartment is rented"));
            }
            if (tenantPhone == null && isBlank(tenantEmail)) {
                details.add(new ErrorDetail("tenantContact", "tenantPhone or tenantEmail is required when apartment is rented"));
            }
        } else {
            tenantName = null;
            tenantDocument = null;
            tenantPhone = null;
            tenantEmail = null;
            rentalStart = null;
            rentalEnd = null;
        }
        if (rentalStart != null && rentalEnd != null && rentalEnd.isBefore(rentalStart)) {
            details.add(new ErrorDetail("rentalEnd", "rentalEnd must be greater than or equal to rentalStart"));
        }
        return new ApartmentDetails(apartment.unit(), apartment.block(), apartment.floor(), apartment.ownerName(),
                apartment.ownerDocument(), apartment.ownerPhone(), apartment.ownerEmail(), apartment.rented(),
                tenantName, tenantDocument, tenantPhone, tenantEmail, rentalStart, rentalEnd,
                apartment.hasVehicle(), apartment.observations());
    }

    private void validateActiveApartmentUniqueness(UUID condominiumId, String unit, String block, UUID excludedId, List<ErrorDetail> details) {
        if (unit != null && block != null && apartmentRepository.existsActiveUnitBlock(condominiumId, unit, block, excludedId)) {
            details.add(new ErrorDetail("unit", "active apartment already exists for this condominium, unit, and block"));
        }
    }

    private void throwIfInvalid(List<ErrorDetail> details) {
        if (!details.isEmpty()) {
            throw new ValidationException("Apartment validation failed", details);
        }
    }

    private String required(String field, String value, List<ErrorDetail> details) {
        String cleaned = clean(value);
        if (cleaned == null) {
            details.add(new ErrorDetail(field, field + " is required"));
        }
        return cleaned;
    }

    private String normalizePhone(String field, String value, List<ErrorDetail> details) {
        String cleaned = clean(value);
        if (cleaned == null) {
            return null;
        }
        String digits = NON_DIGITS.matcher(cleaned).replaceAll("");
        if (digits.length() != 10 && digits.length() != 11) {
            details.add(new ErrorDetail(field, field + " must contain 10 or 11 digits"));
        }
        return digits;
    }

    private String valueOrCurrent(String value, String current) {
        return value == null ? current : clean(value);
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            String cleaned = clean(value);
            if (cleaned != null) {
                return cleaned;
            }
        }
        return null;
    }

    private String clean(String value) {
        if (value == null) {
            return null;
        }
        String cleaned = value.trim();
        return cleaned.isEmpty() ? null : cleaned;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
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
