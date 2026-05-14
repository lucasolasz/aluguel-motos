package com.ltech.backend.domain.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltech.backend.domain.entities.Acessorio;

public interface AcessorioRepository extends JpaRepository<Acessorio, UUID> {
}
