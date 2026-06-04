package com.ltech.backend.domain.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltech.backend.domain.entities.ClienteAsass;

public interface ClienteAsassRepository extends JpaRepository<ClienteAsass, UUID> {
    Optional<ClienteAsass> findByUsuarioId(String usuarioId);
    Optional<ClienteAsass> findByCustomerId(String customerId);
}