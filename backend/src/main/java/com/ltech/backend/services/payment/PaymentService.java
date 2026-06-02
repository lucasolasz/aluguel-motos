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

    PagamentoResult cobrarAluguel(Reserva reserva, BigDecimal valor, String cvv);

    PagamentoResult autorizarCaucao(Reserva reserva, BigDecimal valor, String cvv);

    PagamentoResult liberarCaucao(Pagamento caucaoAutorizada);

    PagamentoResult capturarCaucao(Pagamento caucaoAutorizada, BigDecimal valor);
}
