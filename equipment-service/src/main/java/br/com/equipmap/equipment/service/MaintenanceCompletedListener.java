package br.com.equipmap.equipment.service;

import br.com.equipmap.core.constants.RabbitMqConstants;
import br.com.equipmap.core.events.MaintenanceCompletedEvent;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.UUID;

@Component
public class MaintenanceCompletedListener {
    private final EquipmentService equipmentService;

    public MaintenanceCompletedListener(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    @RabbitListener(queues = RabbitMqConstants.MAINTENANCE_COMPLETED_QUEUE)
    public void onMaintenanceCompleted(MaintenanceCompletedEvent event) {
        if (event.equipmentId() == null || event.condominiumId() == null || event.completedDate() == null) {
            return;
        }
        LocalDate completedDate = event.completedDate().atZone(ZoneOffset.UTC).toLocalDate();
        equipmentService.updateLastMaintenance(
                UUID.fromString(event.condominiumId()),
                UUID.fromString(event.equipmentId()),
                completedDate
        );
    }
}
