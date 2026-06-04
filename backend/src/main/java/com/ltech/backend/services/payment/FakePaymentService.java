package com.ltech.backend.services.payment;

import java.math.BigDecimal;
import java.util.UUID;

import com.ltech.backend.domain.entities.Pagamento;
import com.ltech.backend.domain.entities.Reserva;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class FakePaymentService implements PaymentService {

    private static final String METODO = "SIMULADO";

    @Override
    public PagamentoResult cobrarAluguel(Reserva reserva, BigDecimal valor, String cvv) {
        return aprovar("cobrança aluguel", reserva, valor);
    }

    @Override
    public PagamentoResult autorizarCaucao(Reserva reserva, BigDecimal valor, String cvv) {
        return aprovar("autorização caução (hold)", reserva, valor);
    }

    @Override
    public PagamentoResult liberarCaucao(Pagamento caucaoAutorizada) {
        log.info("[FAKE] Liberando hold de caução: pagamento={} valor={}",
                caucaoAutorizada.getId(), caucaoAutorizada.getValor());
        return new PagamentoResult(true, novoTxId(), METODO, "Hold liberado (simulado)", null, null, null, null);
    }

    @Override
    public PagamentoResult capturarCaucao(Pagamento caucaoAutorizada, BigDecimal valor) {
        log.info("[FAKE] Capturando caução: pagamento={} valor={}",
                caucaoAutorizada.getId(), valor);
        return new PagamentoResult(true, novoTxId(), METODO, "Caução capturada (simulado)", null, null, null, null);
    }

    private PagamentoResult aprovar(String op, Reserva reserva, BigDecimal valor) {
        log.info("[FAKE] {} aprovada: reserva={} valor={}", op, reserva.getId(), valor);
        return new PagamentoResult(true, novoTxId(), METODO, "Aprovado (simulado)", null, null, null, null);
    }

    private String novoTxId() {
        return "SIM-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
    }
}
