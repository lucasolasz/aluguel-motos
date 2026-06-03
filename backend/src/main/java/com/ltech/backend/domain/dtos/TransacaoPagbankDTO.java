package com.ltech.backend.domain.dtos;

import java.time.LocalDateTime;

import com.ltech.backend.domain.entities.TransacaoPagbank;

public record TransacaoPagbankDTO(
        String id,
        String tipo,
        String status,
        Integer valorCentavos,
        String chargeIdPagbank,
        String idempotencyKey,
        LocalDateTime createdAt) {

    public static TransacaoPagbankDTO from(TransacaoPagbank t) {
        return new TransacaoPagbankDTO(
                t.getId().toString(),
                t.getTipo().name(),
                t.getStatus().name(),
                t.getValorCentavos(),
                t.getChargeIdPagbank(),
                t.getIdempotencyKey(),
                t.getCreatedAt());
    }
}
