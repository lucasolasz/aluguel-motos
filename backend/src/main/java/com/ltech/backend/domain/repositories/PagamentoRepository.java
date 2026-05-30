package com.ltech.backend.domain.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltech.backend.domain.entities.Pagamento;
import com.ltech.backend.domain.entities.TipoPagamento;

public interface PagamentoRepository extends JpaRepository<Pagamento, UUID> {

    List<Pagamento> findByReservaIdOrderByCreatedAtAsc(UUID reservaId);

    Optional<Pagamento> findFirstByReservaIdAndTipoOrderByCreatedAtDesc(UUID reservaId, TipoPagamento tipo);
}
