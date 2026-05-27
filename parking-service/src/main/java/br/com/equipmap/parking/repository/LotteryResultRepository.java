package br.com.equipmap.parking.repository;

import br.com.equipmap.parking.domain.LotteryResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface LotteryResultRepository extends JpaRepository<LotteryResult, UUID> {
    List<LotteryResult> findByCondominiumIdOrderByDrawnAtDesc(UUID condominiumId);

    @Query("select r.apartmentId from LotteryResult r where r.condominiumId = :condominiumId")
    Set<UUID> findDrawnApartmentIds(@Param("condominiumId") UUID condominiumId);

    @Query("select r.parkingSpotId from LotteryResult r where r.condominiumId = :condominiumId")
    Set<UUID> findDrawnSpotIds(@Param("condominiumId") UUID condominiumId);
}
