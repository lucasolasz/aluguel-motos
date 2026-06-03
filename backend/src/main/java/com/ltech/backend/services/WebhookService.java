package com.ltech.backend.services;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ltech.backend.config.PagBankProperties;
import com.ltech.backend.domain.entities.TransacaoPagbank;
import com.ltech.backend.domain.repositories.TransacaoPagbankRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class WebhookService {

    private final PagBankProperties pagBankProperties;
    private final TransacaoPagbankRepository transacaoPagbankRepository;
    private final ObjectMapper objectMapper;

    public WebhookService(PagBankProperties pagBankProperties,
                           TransacaoPagbankRepository transacaoPagbankRepository) {
        this.pagBankProperties = pagBankProperties;
        this.transacaoPagbankRepository = transacaoPagbankRepository;
        this.objectMapper = new ObjectMapper();
    }

    public boolean validarAssinatura(String payload, String signatureHeader) {
        String secret = pagBankProperties.getWebhookSecret();
        if (secret == null || secret.isBlank()) {
            log.warn("PAGBANK_WEBHOOK_SECRET nao configurada. Assinatura nao validada.");
            return true;
        }

        try {
            Mac hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(
                    secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmac.init(keySpec);
            byte[] hash = hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));

            StringBuilder expected = new StringBuilder();
            for (byte b : hash) {
                expected.append(String.format("%02x", b));
            }

            boolean valid = expected.toString().equals(signatureHeader);
            if (!valid) {
                log.warn("Assinatura do webhook inválida. Esperado: {} Recebido: {}",
                        expected.substring(0, 8) + "...", signatureHeader);
            }
            return valid;
        } catch (Exception e) {
            log.error("Erro ao validar assinatura do webhook", e);
            return false;
        }
    }

    @SuppressWarnings("unchecked")
    @Transactional
    public void processar(String payload) {
        try {
            Map<String, Object> body = objectMapper.readValue(payload, Map.class);

            Map<String, Object> charge = (Map<String, Object>) body.get("charge");
            if (charge == null) {
                log.warn("Webhook sem objeto 'charge' no payload");
                return;
            }

            String chargeId = (String) charge.get("id");
            String status = (String) charge.get("status");

            if (chargeId == null || status == null) {
                log.warn("Webhook sem charge.id ou charge.status");
                return;
            }

            var optTransacao = transacaoPagbankRepository.findByChargeIdPagbank(chargeId);
            if (optTransacao.isEmpty()) {
                log.warn("Webhook recebido para charge desconhecida: chargeId={} status={}",
                        chargeId, status);
                return;
            }

            TransacaoPagbank transacao = optTransacao.get();
            TransacaoPagbank.Status novoStatus = mapWebhookStatus(status);

            if (transacao.getStatus() == novoStatus) {
                log.info("Webhook ignorado (status duplicado): chargeId={} status={}",
                        chargeId, status);
                return;
            }

            transacao.setStatus(novoStatus);
            transacaoPagbankRepository.save(transacao);

            log.info("Transacao atualizada via webhook: chargeId={} status={}->{}",
                    chargeId, transacao.getStatus(), novoStatus);

        } catch (Exception e) {
            log.error("Erro ao processar webhook do PagBank", e);
            throw new RuntimeException("Falha ao processar webhook", e);
        }
    }

    private TransacaoPagbank.Status mapWebhookStatus(String pagBankStatus) {
        return switch (pagBankStatus) {
            case "PAID" -> TransacaoPagbank.Status.PAID;
            case "AUTHORIZED" -> TransacaoPagbank.Status.AUTHORIZED;
            case "CANCELED" -> TransacaoPagbank.Status.CANCELED;
            case "DECLINED" -> TransacaoPagbank.Status.DECLINED;
            default -> TransacaoPagbank.Status.AUTHORIZED;
        };
    }
}
