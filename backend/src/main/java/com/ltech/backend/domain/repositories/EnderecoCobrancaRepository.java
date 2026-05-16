package com.ltech.backend.domain.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltech.backend.domain.entities.EnderecoCobranca;

public interface EnderecoCobrancaRepository extends JpaRepository<EnderecoCobranca, UUID> {
    List<EnderecoCobranca> findByUsuarioIdOrderByCreatedAtDesc(String usuarioId);
}
