package com.ltech.backend.domain.dtos;

import java.time.LocalDateTime;
import java.util.List;

import com.ltech.backend.domain.entities.Usuario;

public record ClienteDTO(
        String id,
        String username,
        String nomeCompleto,
        String telefone,
        String cpf,
        String numeroCnh,
        String fotoPerfil,
        LocalDateTime createdAt,
        int totalReservas,
        List<String> grupos) {

    public static ClienteDTO from(Usuario usuario, int totalReservas) {
        List<String> grupos = usuario.getGrupo() != null
                ? List.of(usuario.getGrupo().getNome())
                : List.of();

        return new ClienteDTO(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getNomeCompleto(),
                usuario.getTelefone(),
                usuario.getCpf(),
                usuario.getNumeroCnh(),
                usuario.getFotoPerfil(),
                usuario.getCreatedAt(),
                totalReservas,
                grupos);
    }
}