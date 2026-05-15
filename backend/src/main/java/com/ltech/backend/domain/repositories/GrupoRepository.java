package com.ltech.backend.domain.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltech.backend.domain.entities.Grupo;

public interface GrupoRepository extends JpaRepository<Grupo, Long> {

    Optional<Grupo> findByNome(String nome);
}
