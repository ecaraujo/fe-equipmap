package br.com.equipmap.maintenance.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class MaintenanceScheduler {
    private final MaintenanceService maintenanceService;

    public MaintenanceScheduler(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @Scheduled(cron = "0 5 3 * * *")
    public void markOverdue() {
        maintenanceService.markOverdue(LocalDate.now());
    }
}
