package com.ltech.backend.domain.dtos;

import java.time.LocalDateTime;

import com.ltech.backend.domain.entities.Usuario;

public record UsuarioPerfilDTO(
        String id,
        String username,
        String nomeCompleto,
        String telefone,
        String cpf,
        String numeroCnh,
        String fotoPerfil,
        LocalDateTime createdAt) {

    public static UsuarioPerfilDTO from(Usuario usuario) {
        return new UsuarioPerfilDTO(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getNomeCompleto(),
                usuario.getTelefone(),
                usuario.getCpf(),
                usuario.getNumeroCnh(),
                usuario.getFotoPerfil(),
                usuario.getCreatedAt());
    }
}
