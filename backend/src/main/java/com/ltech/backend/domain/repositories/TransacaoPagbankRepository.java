package com.ltech.backend.domain.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ltech.backend.domain.entities.TransacaoPagbank;

public interface TransacaoPagbankRepository extends JpaRepository<TransacaoPagbank, UUID> {

    List<TransacaoPagbank> findByReservaIdOrderByCreatedAtAsc(UUID reservaId);

    Optional<TransacaoPagbank> findFirstByReservaIdAndTipoOrderByCreatedAtDesc(
            UUID reservaId, TransacaoPagbank.Tipo tipo);

    Optional<TransacaoPagbank> findByIdempotencyKey(String idempotencyKey);

    Optional<TransacaoPagbank> findByChargeIdPagbank(String chargeIdPagbank);

    @Query("""
        SELECT t FROM TransacaoPagbank t
        WHERE t.tipo = com.ltech.backend.domain.entities.TransacaoPagbank.Tipo.CAUCAO_PRE_AUTH
          AND t.status = com.ltech.backend.domain.entities.TransacaoPagbank.Status.AUTHORIZED
          AND t.createdAt < :limite
          AND t.reserva.status = com.ltech.backend.domain.entities.StatusReserva.EM_ANDAMENTO
        ORDER BY t.createdAt ASC
    """)
    List<TransacaoPagbank> findPreAuthExpiring(@Param("limite") java.time.LocalDateTime limite);
}
