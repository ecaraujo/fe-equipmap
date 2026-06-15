package br.com.equipmap.parking.repository;

import br.com.equipmap.parking.domain.Apartment;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApartmentRepository extends JpaRepository<Apartment, UUID> {
    List<Apartment> findByCondominiumIdAndDeletedAtIsNullOrderByBlockAscUnitAsc(UUID condominiumId);

    Optional<Apartment> findByIdAndCondominiumIdAndDeletedAtIsNull(UUID id, UUID condominiumId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Apartment a where a.condominiumId = :condominiumId and a.deletedAt is null order by a.block asc, a.unit asc")
    List<Apartment> findActiveForUpdate(@Param("condominiumId") UUID condominiumId);

    @Query("""
            select count(a) > 0
            from Apartment a
            where a.condominiumId = :condominiumId
              and lower(a.unit) = lower(:unit)
              and lower(a.block) = lower(:block)
              and a.deletedAt is null
              and (:excludedId is null or a.id <> :excludedId)
            """)
    boolean existsActiveUnitBlock(@Param("condominiumId") UUID condominiumId,
                                  @Param("unit") String unit,
                                  @Param("block") String block,
                                  @Param("excludedId") UUID excludedId);
}
