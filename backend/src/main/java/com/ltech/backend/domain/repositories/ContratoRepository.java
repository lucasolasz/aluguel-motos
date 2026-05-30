package com.ltech.backend.domain.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltech.backend.domain.entities.Contrato;

public interface ContratoRepository extends JpaRepository<Contrato, UUID> {

    Optional<Contrato> findFirstByReservaIdOrderByCreatedAtDesc(UUID reservaId);
}
