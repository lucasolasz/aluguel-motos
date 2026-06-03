package com.ltech.backend.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ltech.backend.domain.entities.TransacaoPagbank;
import com.ltech.backend.domain.repositories.TransacaoPagbankRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class PreAuthRenewalJob {

    private final TransacaoPagbankRepository transacaoPagbankRepository;
    private final CobrancaService cobrancaService;

    @Scheduled(cron = "0 0 6 * * ?")
    @Transactional
    public void renovarPreAuthsExpiradas() {
        var count = transacaoPagbankRepository.count();
        if (count == 0) return;

        LocalDateTime limite = LocalDateTime.now().minusDays(26);
        List<TransacaoPagbank> expiradas = transacaoPagbankRepository.findPreAuthExpiring(limite);

        if (expiradas.isEmpty()) return;

        log.info("Renovando {} pré-auths perto de expirar (criadas antes de {})",
                expiradas.size(), limite);

        for (TransacaoPagbank preAuth : expiradas) {
            try {
                Integer valorCentavos = preAuth.getValorCentavos();
                cobrancaService.cancelarCaucao(preAuth);

                cobrancaService.autorizarCaucao(
                        preAuth.getReserva(), valorCentavos, null);

                log.info("Pré-auth renovada: reserva={} valorCentavos={}",
                        preAuth.getReserva().getId(), valorCentavos);
            } catch (Exception e) {
                log.error("Falha ao renovar pré-auth: reserva={} chargeId={}",
                        preAuth.getReserva().getId(),
                        preAuth.getChargeIdPagbank(), e);
            }
        }
    }
}
