package br.com.equipmap.maintenance.service;

import br.com.equipmap.maintenance.domain.MaintenanceRecord;
import br.com.equipmap.maintenance.domain.OutboxEvent;
import br.com.equipmap.maintenance.repository.OutboxEventRepository;
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

    public void maintenanceEvent(MaintenanceRecord record, String routingKey, Object payload, String dedupKey) {
        if (repository.existsByDedupKey(dedupKey)) return;
        try {
            repository.save(new OutboxEvent("MaintenanceRecord", record.getId(), record.getCondominiumId(), routingKey, objectMapper.writeValueAsString(payload), dedupKey));
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not serialize outbox payload", exception);
        } catch (DataIntegrityViolationException ignored) {
            // Another transaction inserted the same idempotency key.
        }
    }
}
