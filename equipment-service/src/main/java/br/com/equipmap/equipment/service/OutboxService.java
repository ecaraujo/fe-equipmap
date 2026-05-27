package br.com.equipmap.equipment.service;

import br.com.equipmap.equipment.domain.Equipment;
import br.com.equipmap.equipment.domain.OutboxEvent;
import br.com.equipmap.equipment.repository.OutboxEventRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

@Service
public class OutboxService {
    private final OutboxEventRepository repository;
    private final ObjectMapper objectMapper;

    public OutboxService(OutboxEventRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public void equipmentEvent(Equipment equipment, String routingKey, Object payload) {
        try {
            repository.save(new OutboxEvent(
                    "Equipment",
                    equipment.getId(),
                    equipment.getCondominiumId(),
                    routingKey,
                    objectMapper.writeValueAsString(payload)
            ));
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not serialize outbox payload", exception);
        }
    }
}
