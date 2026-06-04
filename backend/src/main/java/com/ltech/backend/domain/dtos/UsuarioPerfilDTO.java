package com.ltech.backend.domain.dtos;

import java.time.LocalDateTime;

import com.ltech.backend.domain.entities.Usuario;

public record UsuarioPerfilDTO(
        String id,
        String username,
        String nomeCompleto,
        String ddi,
        String ddd,
        String numero,
        String cpf,
        String fotoPerfil,
        LocalDateTime createdAt) {

    public static UsuarioPerfilDTO from(Usuario usuario) {
        return new UsuarioPerfilDTO(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getNomeCompleto(),
                usuario.getDdi(),
                usuario.getDdd(),
                usuario.getNumero(),
                usuario.getCpf(),
                usuario.getFotoPerfil(),
                usuario.getCreatedAt());
    }
}
