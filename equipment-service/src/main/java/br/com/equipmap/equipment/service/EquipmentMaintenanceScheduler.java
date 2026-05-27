package br.com.equipmap.equipment.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class EquipmentMaintenanceScheduler {
    private final EquipmentService equipmentService;

    public EquipmentMaintenanceScheduler(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    @Scheduled(cron = "0 15 3 * * *")
    public void markOverdueEquipment() {
        equipmentService.markOverdueMaintenance(LocalDate.now());
    }
}
