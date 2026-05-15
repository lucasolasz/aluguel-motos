package com.ltech.backend.domain.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltech.backend.domain.entities.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, String> {

    Optional<Usuario> findByUsername(String username);
}
