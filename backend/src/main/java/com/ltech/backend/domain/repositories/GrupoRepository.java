package com.ltech.backend.domain.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltech.backend.domain.entities.Grupo;

public interface GrupoRepository extends JpaRepository<Grupo, Long> {
}
