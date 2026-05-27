package br.com.equipmap.maintenance.repository;

import br.com.equipmap.maintenance.domain.OutboxEvent;
import br.com.equipmap.maintenance.domain.OutboxStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {
    List<OutboxEvent> findByStatusInOrderByCreatedAtAsc(List<OutboxStatus> statuses, Pageable pageable);

    boolean existsByDedupKey(String dedupKey);
}
