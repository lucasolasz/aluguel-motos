package com.ltech.backend.domain.dtos;

public record UpdateUsuarioPerfilDTO(
        String nomeCompleto,
        String telefone,
        String numeroCnh,
        String fotoPerfil) {
}
