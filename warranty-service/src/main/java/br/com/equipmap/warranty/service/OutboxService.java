package br.com.equipmap.warranty.service;

import br.com.equipmap.warranty.domain.OutboxEvent;
import br.com.equipmap.warranty.domain.Warranty;
import br.com.equipmap.warranty.repository.OutboxEventRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
public class OutboxService {
    private final OutboxEventRepository repository;
    private final ObjectMapper objectMapper;

    public OutboxService(OutboxEventRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public boolean warrantyEvent(Warranty warranty, String routingKey, Object payload) {
        String dedupKey = routingKey + ":" + warranty.getId() + ":" + warranty.getCondominiumId();
        if (repository.existsByDedupKey(dedupKey)) return false;
        try {
            repository.save(new OutboxEvent("Warranty", warranty.getId(), warranty.getCondominiumId(), routingKey, objectMapper.writeValueAsString(payload), dedupKey));
            return true;
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not serialize outbox payload", exception);
        } catch (DataIntegrityViolationException ignored) {
            // Another transaction inserted the same business deduplication key.
            return false;
        }
    }
}
