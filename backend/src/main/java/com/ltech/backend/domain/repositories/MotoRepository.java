package com.ltech.backend.domain.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltech.backend.domain.entities.Moto;

public interface MotoRepository extends JpaRepository<Moto, UUID> {

    List<Moto> findByDisponivelTrue();

    List<Moto> findByCategoriaId(UUID categoriaId);

    List<Moto> findByMarcaIgnoreCase(String marca);

    List<Moto> findByNomeContainingIgnoreCase(String nome);
}
