package com.ltech.backend.services.payment;

import java.math.BigDecimal;

import com.ltech.backend.domain.entities.Pagamento;
import com.ltech.backend.domain.entities.Reserva;

public interface PaymentService {

    PagamentoResult cobrarAluguel(Reserva reserva, BigDecimal valor, String cvv);

    PagamentoResult autorizarCaucao(Reserva reserva, BigDecimal valor, String cvv);

    PagamentoResult liberarCaucao(Pagamento caucaoAutorizada);

    PagamentoResult capturarCaucao(Pagamento caucaoAutorizada, BigDecimal valor);
}
