package com.ltech.backend.domain.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltech.backend.domain.entities.Cnh;

public interface CnhRepository extends JpaRepository<Cnh, UUID> {

    Optional<Cnh> findByUsuarioId(String usuarioId);
}
