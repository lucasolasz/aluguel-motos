package com.ltech.backend.services.payment;

import java.math.BigDecimal;

import com.ltech.backend.domain.entities.Pagamento;
import com.ltech.backend.domain.entities.Reserva;

/**
 * Abstração do gateway de pagamento. Desacopla a aplicação do provider concreto.
 * Hoje implementado por {@link FakePaymentService} (simulado); trocar por
 * PagBank = nova implementação desta interface, sem alterar os callers.
 */
public interface PaymentService {

    /** Cobra o valor do aluguel (captura imediata). */
    PagamentoResult cobrarAluguel(Reserva reserva, BigDecimal valor);

    /** Pré-autoriza (hold/bloqueio) o valor da caução, sem capturar. */
    PagamentoResult autorizarCaucao(Reserva reserva, BigDecimal valor);

    /** Libera integralmente o hold da caução na devolução sem avarias. */
    PagamentoResult liberarCaucao(Pagamento caucaoAutorizada);

    /** Captura (cobra) parte ou todo o hold da caução por descontos na devolução. */
    PagamentoResult capturarCaucao(Pagamento caucaoAutorizada, BigDecimal valor);
}
