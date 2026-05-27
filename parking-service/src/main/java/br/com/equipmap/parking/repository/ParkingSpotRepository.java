package br.com.equipmap.parking.repository;

import br.com.equipmap.parking.domain.ParkingSpot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, UUID> {
    List<ParkingSpot> findByCondominiumIdAndDeletedAtIsNullOrderByNumberAsc(UUID condominiumId);

    Optional<ParkingSpot> findByIdAndCondominiumIdAndDeletedAtIsNull(UUID id, UUID condominiumId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from ParkingSpot s where s.condominiumId = :condominiumId and s.deletedAt is null order by s.number asc")
    List<ParkingSpot> findActiveForUpdate(@Param("condominiumId") UUID condominiumId);
}
