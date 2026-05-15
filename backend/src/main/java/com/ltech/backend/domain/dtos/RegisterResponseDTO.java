package com.ltech.backend.domain.dtos;

import java.time.LocalDateTime;

public record RegisterResponseDTO(
        String username,
        boolean enabled,
        LocalDateTime createdAt,
        GrupoDTO grupo // Dados do grupo (opcional, dependendo do caso)
) {

    public record GrupoDTO(String nome) {
    }
}
