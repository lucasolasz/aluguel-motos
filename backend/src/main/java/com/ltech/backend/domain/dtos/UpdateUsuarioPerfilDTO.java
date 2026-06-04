package com.ltech.backend.domain.dtos;

public record UpdateUsuarioPerfilDTO(
        String nomeCompleto,
        String ddi,
        String ddd,
        String numero,
        String fotoPerfil) {
}
