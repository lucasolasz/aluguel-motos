package com.ltech.backend.services.payment;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;

import com.ltech.backend.domain.dtos.asaas.AsaasPaymentResponse;
import com.ltech.backend.domain.entities.BillingType;
import com.ltech.backend.domain.entities.Pagamento;
import com.ltech.backend.domain.entities.Reserva;
import com.ltech.backend.services.AsaasService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class AsaasPaymentService implements PaymentService {

    private final AsaasService asaasService;

    @Override
    public PagamentoResult cobrarAluguel(Reserva reserva, BigDecimal valor, String cvv) {
        log.info("Cobrando aluguel via Asaas: reserva={} valor={}", reserva.getId(), valor);
        AsaasPaymentResponse response = asaasService.criarCobrancaCartao(reserva, cvv);
        boolean sucesso = "CONFIRMED".equals(response.status()) || "RECEIVED".equals(response.status());
        BillingType billingType = parseBillingType(response.billingType());
        log.info("Asaas charge response: id={} status={}", response.id(), response.status());
        return new PagamentoResult(
                sucesso,
                response.id(),
                response.billingType(),
                "Asaas: " + response.status(),
                response.netValue(),
                billingType,
                response.invoiceUrl(),
                response.transactionReceiptUrl());
    }

    @Override
    public PagamentoResult autorizarCaucao(Reserva reserva, BigDecimal valor, String cvv) {
        // Caução via Asaas será implementada futuramente. Retorna sucesso simulado.
        log.info("[STUB] Autorização de caução: reserva={} valor={}", reserva.getId(), valor);
        return new PagamentoResult(true, null, "SIMULADO", "Caução autorizada (stub)", null, null, null, null);
    }

    @Override
    public PagamentoResult liberarCaucao(Pagamento caucaoAutorizada) {
        log.info("[STUB] Liberando caução: pagamento={}", caucaoAutorizada.getId());
        return new PagamentoResult(true, null, "SIMULADO", "Caução liberada (stub)", null, null, null, null);
    }

    @Override
    public PagamentoResult capturarCaucao(Pagamento caucaoAutorizada, BigDecimal valor) {
        log.info("[STUB] Capturando caução: pagamento={} valor={}", caucaoAutorizada.getId(), valor);
        return new PagamentoResult(true, null, "SIMULADO", "Caução capturada (stub)", null, null, null, null);
    }

    private BillingType parseBillingType(String raw) {
        if (raw == null) return null;
        try {
            return BillingType.valueOf(raw);
        } catch (IllegalArgumentException e) {
            return BillingType.UNDEFINED;
        }
    }
}
