package com.ltech.backend.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ltech.backend.domain.entities.Cartao;
import com.ltech.backend.domain.entities.Reserva;
import com.ltech.backend.domain.entities.TransacaoPagbank;
import com.ltech.backend.domain.repositories.TransacaoPagbankRepository;
import com.ltech.backend.services.payment.PagBankService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class CobrancaService {

    private final PagBankService pagBankService;
    private final CardEncryptionService cardEncryptionService;
    private final TransacaoPagbankRepository transacaoPagbankRepository;

    @Transactional
    public TransacaoPagbank cobrarAluguel(Reserva reserva, Integer valorCentavos, String cvv) {
        String idempotencyKey = "reserva-" + reserva.getId() + "-aluguel";
        return executarCobranca(reserva, valorCentavos, cvv, true,
                TransacaoPagbank.Tipo.ALUGUEL, "Aluguel de moto", idempotencyKey);
    }

    @Transactional
    public TransacaoPagbank autorizarCaucao(Reserva reserva, Integer valorCentavos, String cvv) {
        String idempotencyKey = "reserva-" + reserva.getId() + "-caucao";
        return executarCobranca(reserva, valorCentavos, cvv, false,
                TransacaoPagbank.Tipo.CAUCAO_PRE_AUTH, "Pré-autorização caução", idempotencyKey);
    }

    @Transactional
    public TransacaoPagbank cancelarCaucao(TransacaoPagbank preAuth) {
        String idempotencyKey = "reserva-" + preAuth.getReserva().getId() + "-caucao-cancel";

        pagBankService.cancelarCobranca(preAuth.getChargeIdPagbank(), idempotencyKey);

        TransacaoPagbank cancelamento = TransacaoPagbank.builder()
                .reserva(preAuth.getReserva())
                .tipo(TransacaoPagbank.Tipo.CAUCAO_CANCELAMENTO)
                .chargeIdPagbank(preAuth.getChargeIdPagbank())
                .valorCentavos(preAuth.getValorCentavos())
                .status(TransacaoPagbank.Status.CANCELED)
                .idempotencyKey(idempotencyKey)
                .build();

        preAuth.setStatus(TransacaoPagbank.Status.CANCELED);
        transacaoPagbankRepository.save(preAuth);

        log.info("Caução cancelada: reserva={} chargeId={}",
                preAuth.getReserva().getId(), preAuth.getChargeIdPagbank());
        return transacaoPagbankRepository.save(cancelamento);
    }

    @Transactional
    public TransacaoPagbank capturarCaucao(TransacaoPagbank preAuth, Integer valorCentavos) {
        String idempotencyKey = "reserva-" + preAuth.getReserva().getId() + "-caucao-capture";

        int valorCapturar = Math.min(valorCentavos, preAuth.getValorCentavos());

        pagBankService.capturarCobranca(preAuth.getChargeIdPagbank(), valorCapturar, idempotencyKey);

        preAuth.setStatus(TransacaoPagbank.Status.PAID);
        preAuth.setValorCentavos(valorCapturar);
        transacaoPagbankRepository.save(preAuth);

        TransacaoPagbank captura = TransacaoPagbank.builder()
                .reserva(preAuth.getReserva())
                .tipo(TransacaoPagbank.Tipo.CAUCAO_CAPTURA)
                .chargeIdPagbank(preAuth.getChargeIdPagbank())
                .valorCentavos(valorCapturar)
                .status(TransacaoPagbank.Status.PAID)
                .idempotencyKey(idempotencyKey)
                .build();

        log.info("Caução capturada: reserva={} chargeId={} valorCentavos={}",
                preAuth.getReserva().getId(), preAuth.getChargeIdPagbank(), valorCapturar);
        return transacaoPagbankRepository.save(captura);
    }

    @Transactional
    public TransacaoPagbank estornar(TransacaoPagbank transacao, Integer valorCentavos) {
        String idempotencyKey = "reserva-" + transacao.getReserva().getId() + "-estorno";

        pagBankService.estornarCobranca(transacao.getChargeIdPagbank(),
                valorCentavos, idempotencyKey);

        transacao.setStatus(TransacaoPagbank.Status.CANCELED);
        transacaoPagbankRepository.save(transacao);

        log.info("Estorno realizado: reserva={} chargeId={} valorCentavos={}",
                transacao.getReserva().getId(), transacao.getChargeIdPagbank(), valorCentavos);
        return transacao;
    }

    public List<TransacaoPagbank> listarPorReserva(UUID reservaId) {
        return transacaoPagbankRepository.findByReservaIdOrderByCreatedAtAsc(reservaId);
    }

    // ─── Helpers ────────────────────────────────────────────────────────────

    private TransacaoPagbank executarCobranca(Reserva reserva, Integer valorCentavos, String cvv,
            boolean capturar, TransacaoPagbank.Tipo tipo, String descricao, String idempotencyKey) {

        var existente = transacaoPagbankRepository.findByIdempotencyKey(idempotencyKey);
        if (existente.isPresent()) {
            log.info("Transação idempotente reutilizada: idempotencyKey={}", idempotencyKey);
            return existente.get();
        }

        Cartao cartao = reserva.getCartao();
        if (cartao == null) {
            throw new IllegalStateException("Reserva sem cartão");
        }
        if (cartao.getTokenPagBank() == null) {
            throw new IllegalStateException("Cartão sem token PagBank");
        }

        String nome = cardEncryptionService.decrypt(cartao.getNome());
        String cpf = cardEncryptionService.decrypt(cartao.getCpf());

        BigDecimal valor = new BigDecimal(valorCentavos).movePointLeft(2);

        PagBankService.ChargeResult result = pagBankService.criarCobranca(
                cartao.getTokenPagBank(), cvv, nome, cpf, valor,
                "reserva-" + reserva.getId().toString().substring(0, 8) + "-" + tipo.name().toLowerCase(),
                descricao, capturar, idempotencyKey);

        TransacaoPagbank.Status status = mapStatus(result.status(), capturar);

        TransacaoPagbank transacao = TransacaoPagbank.builder()
                .reserva(reserva)
                .tipo(tipo)
                .chargeIdPagbank(result.chargeId())
                .valorCentavos(valorCentavos)
                .status(status)
                .idempotencyKey(idempotencyKey)
                .build();

        log.info("Transação registrada: reserva={} tipo={} status={} chargeId={} centavos={}",
                reserva.getId(), tipo, status, result.chargeId(), valorCentavos);

        return transacaoPagbankRepository.save(transacao);
    }

    private TransacaoPagbank.Status mapStatus(String pagBankStatus, boolean capturar) {
        return switch (pagBankStatus) {
            case "PAID" -> TransacaoPagbank.Status.PAID;
            case "AUTHORIZED" -> TransacaoPagbank.Status.AUTHORIZED;
            case "CANCELED" -> TransacaoPagbank.Status.CANCELED;
            case "DECLINED" -> TransacaoPagbank.Status.DECLINED;
            default -> capturar ? TransacaoPagbank.Status.PAID : TransacaoPagbank.Status.AUTHORIZED;
        };
    }
}
