package br.com.equipmap.maintenance.domain;

public enum MaintenanceStatus {
    PENDING("Pendente"),
    IN_PROGRESS("Em andamento"),
    COMPLETED("Concluida"),
    OVERDUE("Vencida"),
    CANCELED("Cancelada");

    private final String label;

    MaintenanceStatus(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}
