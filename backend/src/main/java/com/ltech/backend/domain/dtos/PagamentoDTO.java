package com.ltech.backend.domain.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.ltech.backend.domain.entities.Pagamento;

public record PagamentoDTO(
        String id,
        String tipo,
        String status,
        BigDecimal valor,
        String gatewayTransactionId,
        String metodo,
        LocalDateTime createdAt) {

    public static PagamentoDTO from(Pagamento p) {
        return new PagamentoDTO(
                p.getId().toString(),
                p.getTipo().name(),
                p.getStatus().name(),
                p.getValor(),
                p.getGatewayTransactionId(),
                p.getMetodo(),
                p.getCreatedAt());
    }
}
