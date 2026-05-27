package br.com.equipmap.equipment.domain;

public enum EquipmentStatus {
    ACTIVE("Ativo"),
    MAINTENANCE("Manutencao"),
    ALERT("Alerta"),
    INACTIVE("Inativo");

    private final String label;

    EquipmentStatus(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}
