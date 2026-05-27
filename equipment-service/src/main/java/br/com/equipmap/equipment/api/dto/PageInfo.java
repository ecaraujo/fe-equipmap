package br.com.equipmap.equipment.api.dto;

public record PageInfo(
        long total,
        int page,
        int pageSize,
        int totalPages
) {
}
