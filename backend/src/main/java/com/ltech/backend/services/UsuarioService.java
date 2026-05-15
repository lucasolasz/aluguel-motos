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
}
