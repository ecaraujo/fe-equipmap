package br.com.equipmap.maintenance.domain;

public enum MaintenanceType {
    PREVENTIVE("Preventiva"),
    CORRECTIVE("Corretiva"),
    PREDICTIVE("Preditiva");

    private final String label;

    MaintenanceType(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}
