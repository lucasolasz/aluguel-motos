package com.ltech.backend.domain.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltech.backend.domain.entities.Multa;
import com.ltech.backend.domain.entities.StatusMulta;

public interface MultaRepository extends JpaRepository<Multa, UUID> {

    List<Multa> findByReservaIdOrderByCreatedAtAsc(UUID reservaId);

    List<Multa> findAllByOrderByCreatedAtDesc();

    List<Multa> findByStatusOrderByCreatedAtDesc(StatusMulta status);
}
