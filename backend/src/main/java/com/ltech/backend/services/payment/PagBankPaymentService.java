package com.ltech.backend.services.payment;

import java.math.BigDecimal;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import com.ltech.backend.domain.entities.Pagamento;
import com.ltech.backend.domain.entities.Reserva;
import com.ltech.backend.services.payment.PagBankService.ChargeResult;

import lombok.extern.slf4j.Slf4j;

@Service
@ConditionalOnProperty(name = "pagbank.enabled", havingValue = "true")
@Slf4j
public class PagBankPaymentService implements PaymentService {

    private final PagBankService pagBankService;
    private static final String METODO = "CREDIT_CARD";

    public PagBankPaymentService(PagBankService pagBankService) {
        this.pagBankService = pagBankService;
    }

    @Override
    public PagamentoResult cobrarAluguel(Reserva reserva, BigDecimal valor, String cvv) {
        return executarCobranca(reserva, valor, cvv, true, "aluguel");
    }

    @Override
    public PagamentoResult autorizarCaucao(Reserva reserva, BigDecimal valor, String cvv) {
        return executarCobranca(reserva, valor, cvv, false, "caucao");
    }

    @Override
    public PagamentoResult liberarCaucao(Pagamento caucaoAutorizada) {
        String chargeId = caucaoAutorizada.getGatewayTransactionId();
        try {
            boolean ok = pagBankService.cancelarCobranca(chargeId);
            String msg = ok ? "Caução liberada (hold cancelado)" : "Falha ao liberar caução";
            log.info("[PAGBANK] Liberação caução: sucesso={}", ok);
            return new PagamentoResult(ok, chargeId, METODO, msg);
        } catch (Exception e) {
            log.error("[PAGBANK] Erro ao liberar caução", e);
            return new PagamentoResult(false, chargeId, METODO, "Erro: " + e.getMessage());
        }
    }

    @Override
    public PagamentoResult capturarCaucao(Pagamento caucaoAutorizada, BigDecimal valor) {
        String chargeId = caucaoAutorizada.getGatewayTransactionId();
        try {
            boolean ok = pagBankService.capturarCobranca(chargeId, valor);
            String msg = ok ? "Caução capturada" : "Falha ao capturar caução";
            log.info("[PAGBANK] Captura caução: valor={} sucesso={}", valor, ok);
            return new PagamentoResult(ok, chargeId, METODO, msg);
        } catch (Exception e) {
            log.error("[PAGBANK] Erro ao capturar caução", e);
            return new PagamentoResult(false, chargeId, METODO, "Erro: " + e.getMessage());
        }
    }

    private PagamentoResult executarCobranca(Reserva reserva, BigDecimal valor, String cvv,
            boolean capturar, String tipo) {

        if (reserva.getCartao() == null) {
            return new PagamentoResult(false, null, METODO, "Reserva sem cartão cadastrado");
        }
        if (reserva.getCartao().getTokenPagBank() == null) {
            return new PagamentoResult(false, null, METODO, "Cartão não possui token PagBank");
        }
        if (cvv == null || cvv.isBlank()) {
            return new PagamentoResult(false, null, METODO, "CVV não informado");
        }

        String referenciaId = "reserva-" + reserva.getId().toString().substring(0, 8) + "-" + tipo;
        String idempotencyKey = "reserva-" + reserva.getId() + "-" + tipo;
        String descricao = tipo.equals("aluguel")
                ? "Aluguel de moto"
                : "Pré-autorização caução";

        try {
            ChargeResult result = pagBankService.criarCobranca(
                    reserva.getCartao().getTokenPagBank(),
                    cvv,
                    reserva.getCartao().getNome(),
                    reserva.getCartao().getCpf(),
                    valor,
                    referenciaId,
                    descricao,
                    capturar,
                    idempotencyKey);

            boolean sucesso = "PAID".equals(result.status()) || "AUTHORIZED".equals(result.status());
            log.info("[PAGBANK] {} {} reserva={}: status={} sucesso={}",
                    capturar ? "Cobrança" : "Pré-autorização", tipo, reserva.getId(),
                    result.status(), sucesso);

            return new PagamentoResult(sucesso, result.chargeId(), METODO,
                    sucesso ? result.status() : "Status inesperado: " + result.status());
        } catch (Exception e) {
            log.error("[PAGBANK] Erro na {} {}: reserva={}",
                    capturar ? "cobrança" : "pré-autorização", tipo, reserva.getId(), e);
            return new PagamentoResult(false, null, METODO, "Erro: " + e.getMessage());
        }
    }
}