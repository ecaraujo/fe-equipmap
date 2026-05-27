package br.com.equipmap.equipment.domain;

public enum EquipmentType {
    CLIMATIZATION("Climatizacao"),
    TRANSPORT("Transporte"),
    ELECTRICAL("Eletrica"),
    HYDRAULIC("Hidraulica"),
    SECURITY("Seguranca"),
    OTHER("Outros");

    private final String label;

    EquipmentType(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}
