package com.ltech.backend.domain.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltech.backend.domain.entities.Cartao;

public interface CartaoRepository extends JpaRepository<Cartao, UUID> {
    List<Cartao> findByUsuarioIdOrderByCreatedAtDesc(String usuarioId);
}
