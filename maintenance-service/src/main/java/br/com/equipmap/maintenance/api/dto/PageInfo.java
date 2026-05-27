package br.com.equipmap.maintenance.api.dto;

public record PageInfo(long total, int page, int pageSize, int totalPages) {
}
