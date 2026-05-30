package com.ltech.backend.domain.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltech.backend.domain.entities.TipoVistoria;
import com.ltech.backend.domain.entities.Vistoria;

public interface VistoriaRepository extends JpaRepository<Vistoria, UUID> {

    List<Vistoria> findByReservaIdOrderByCreatedAtAsc(UUID reservaId);

    Optional<Vistoria> findFirstByReservaIdAndTipoOrderByCreatedAtDesc(UUID reservaId, TipoVistoria tipo);
}
