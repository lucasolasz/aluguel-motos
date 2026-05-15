package com.ltech.backend.services;

import org.springframework.stereotype.Service;

import com.ltech.backend.domain.entities.Usuario;
import com.ltech.backend.domain.repositories.UsuarioRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class UsuarioService {

    private UsuarioRepository usuarioRepository;

    public boolean existsByUsername(String username) {
        return this.usuarioRepository.findByUsername(username).isPresent();
    }

    public Usuario save(Usuario usuario) {
        return this.usuarioRepository.save(usuario);
    }

    public Usuario findByUsername(String username) {
        return this.usuarioRepository.findByUsername(username).orElse(null);
    }

    public Usuario atualizarPerfil(String usuarioId, com.ltech.backend.domain.dtos.UpdateUsuarioPerfilDTO dto) {
        Usuario usuario = this.usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        if (dto.nomeCompleto() != null) usuario.setNomeCompleto(dto.nomeCompleto());
        if (dto.email() != null) usuario.setEmail(dto.email());
        if (dto.telefone() != null) usuario.setTelefone(dto.telefone());
        if (dto.numeroCnh() != null) usuario.setNumeroCnh(dto.numeroCnh());
        if (dto.fotoPerfil() != null) usuario.setFotoPerfil(dto.fotoPerfil());

        return this.usuarioRepository.save(usuario);
    }
}
