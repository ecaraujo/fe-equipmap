package br.com.equipmap.notification.service;

import br.com.equipmap.core.error.ForbiddenException;
import br.com.equipmap.core.error.NotFoundException;
import br.com.equipmap.notification.domain.Notification;
import br.com.equipmap.notification.repository.NotificationRepository;
import br.com.equipmap.notification.security.RequestPrincipal;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {
    private final NotificationRepository repository;
    private final NotificationEventMapper eventMapper;

    public NotificationService(NotificationRepository repository, NotificationEventMapper eventMapper) {
        this.repository = repository;
        this.eventMapper = eventMapper;
    }

    @Transactional
    public Notification handleEvent(String routingKey, JsonNode payload) {
        NotificationEventData data = eventMapper.map(routingKey, payload);
        String dedupKey = Notification.dedupKey(data.type(), data.resourceId(), data.userId(), data.condominiumId());
        if (repository.existsByDedupKeyAndDeletedAtIsNull(dedupKey)) {
            return null;
        }
        return repository.save(new Notification(
                data.condominiumId(),
                data.userId(),
                data.type(),
                data.severity(),
                data.resourceId(),
                data.title(),
                data.message(),
                data.payload()
        ));
    }

    @Transactional(readOnly = true)
    public List<Notification> list(RequestPrincipal principal) {
        return repository.findByUserIdAndCondominiumIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                principal.userId(),
                principal.condominiumId()
        );
    }

    @Transactional
    public Notification markRead(UUID id, RequestPrincipal principal) {
        Notification notification = repository.findByIdAndUserIdAndCondominiumIdAndDeletedAtIsNull(
                id,
                principal.userId(),
                principal.condominiumId()
        ).orElseThrow(() -> new NotFoundException("Notification not found"));
        notification.markRead();
        return notification;
    }

    @Transactional
    public int markAllRead(RequestPrincipal principal) {
        List<Notification> unread = repository.findByUserIdAndCondominiumIdAndReadFalseAndDeletedAtIsNull(
                principal.userId(),
                principal.condominiumId()
        );
        unread.forEach(Notification::markRead);
        return unread.size();
    }

    @Transactional
    public void delete(UUID id, RequestPrincipal principal) {
        Notification notification = repository.findByIdAndCondominiumIdAndDeletedAtIsNull(id, principal.condominiumId())
                .orElseThrow(() -> new NotFoundException("Notification not found"));
        if (!notification.getUserId().equals(principal.userId())) {
            throw new ForbiddenException("Cannot delete another user's notification");
        }
        notification.delete();
    }
}
