package br.com.equipmap.parking.repository;

import br.com.equipmap.parking.domain.LotterySession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LotterySessionRepository extends JpaRepository<LotterySession, UUID> {
    List<LotterySession> findByCondominiumIdOrderByDrawnAtDesc(UUID condominiumId);

    void deleteByCondominiumId(UUID condominiumId);
}
