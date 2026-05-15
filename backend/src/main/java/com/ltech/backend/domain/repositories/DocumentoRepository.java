package com.ltech.backend.domain.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltech.backend.domain.entities.Documento;
import com.ltech.backend.domain.entities.TipoDocumento;

public interface DocumentoRepository extends JpaRepository<Documento, UUID> {

    List<Documento> findByUsuarioIdOrderByCreatedAtDesc(String usuarioId);

    Optional<Documento> findByUsuarioIdAndTipo(String usuarioId, TipoDocumento tipo);
}
