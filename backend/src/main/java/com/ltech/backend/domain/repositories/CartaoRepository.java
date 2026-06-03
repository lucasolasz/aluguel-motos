package com.ltech.backend.domain.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ltech.backend.domain.entities.Cartao;

public interface CartaoRepository extends JpaRepository<Cartao, UUID> {

    @Query("SELECT c FROM Cartao c WHERE c.usuario.id = :usuarioId AND c.ativo = true ORDER BY c.createdAt DESC")
    List<Cartao> findByUsuarioIdOrderByCreatedAtDesc(@Param("usuarioId") String usuarioId);

    boolean existsByUsuarioIdAndFingerprint(String usuarioId, String fingerprint);
}
