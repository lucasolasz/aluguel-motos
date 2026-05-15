package com.ltech.backend.domain.dtos;

public record UpdateUsuarioPerfilDTO(
        String nomeCompleto,
        String email,
        String telefone,
        String numeroCnh,
        String fotoPerfil) {
}
