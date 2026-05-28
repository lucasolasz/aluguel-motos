package com.ltech.backend.domain.dtos;

public record CategoriaRequestDTO(
    String nome,
    String descricao,
    String slug,
    String imageUrl
) {
}