package br.com.equipmap.warranty.api.dto;

public record PageInfo(int page, int pageSize, long total, int totalPages) {
}
