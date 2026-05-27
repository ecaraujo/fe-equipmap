package br.com.equipmap.notification.repository;

import br.com.equipmap.notification.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    boolean existsByDedupKeyAndDeletedAtIsNull(String dedupKey);

    List<Notification> findByUserIdAndCondominiumIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID userId, UUID condominiumId);

    List<Notification> findByUserIdAndCondominiumIdAndReadFalseAndDeletedAtIsNull(UUID userId, UUID condominiumId);

    Optional<Notification> findByIdAndUserIdAndCondominiumIdAndDeletedAtIsNull(UUID id, UUID userId, UUID condominiumId);

    Optional<Notification> findByIdAndCondominiumIdAndDeletedAtIsNull(UUID id, UUID condominiumId);
}
