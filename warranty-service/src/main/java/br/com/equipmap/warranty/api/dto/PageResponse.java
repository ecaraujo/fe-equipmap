package br.com.equipmap.warranty.api.dto;

import java.util.List;

public record PageResponse<T>(List<T> data, PageInfo pageInfo) {
}
