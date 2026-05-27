package br.com.equipmap.brigadier.repository;

import br.com.equipmap.brigadier.domain.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationLogRepository extends JpaRepository<NotificationLog, UUID> {
    List<NotificationLog> findByCondominiumIdOrderByCreatedAtDesc(UUID condominiumId);
}
