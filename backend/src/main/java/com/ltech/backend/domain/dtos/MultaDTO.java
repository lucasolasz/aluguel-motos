package com.ltech.backend.domain.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.ltech.backend.domain.entities.Multa;

public record MultaDTO(
        String id,
        String reservaId,
        String tipo,
        String status,
        String descricao,
        String observacoes,
        BigDecimal valor,
        String criadoPor,
        LocalDateTime createdAt) {

    public static MultaDTO from(Multa m) {
        return new MultaDTO(
                m.getId().toString(),
                m.getReserva().getId().toString(),
                m.getTipo().name(),
                m.getStatus().name(),
                m.getDescricao(),
                m.getObservacoes(),
                m.getValor(),
                m.getCriadoPor(),
                m.getCreatedAt());
    }
}
