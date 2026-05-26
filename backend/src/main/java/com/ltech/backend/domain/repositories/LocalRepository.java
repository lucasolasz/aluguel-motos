package com.ltech.backend.domain.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltech.backend.domain.entities.Local;

public interface LocalRepository extends JpaRepository<Local, UUID> {

    List<Local> findAllByAtivoTrueOrderByNomeAsc();
}
