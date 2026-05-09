package com.ltech.backend.domain.dtos;

import java.util.UUID;

public record CategoriaDTO(UUID id, String nome, String descricao,  String slug, String imageUrl) {
}
