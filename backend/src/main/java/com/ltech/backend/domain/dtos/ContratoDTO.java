package com.ltech.backend.domain.dtos;

import java.time.LocalDateTime;

import com.ltech.backend.domain.entities.Contrato;

public record ContratoDTO(
        String id,
        String tipoAssinatura,
        String urlDocumento,
        String assinaturaUrl,
        LocalDateTime assinadoEm,
        LocalDateTime createdAt) {

    public static ContratoDTO from(Contrato c) {
        if (c == null) return null;
        return new ContratoDTO(
                c.getId().toString(),
                c.getTipoAssinatura() != null ? c.getTipoAssinatura().name() : null,
                c.getUrlDocumento(),
                c.getAssinaturaUrl(),
                c.getAssinadoEm(),
                c.getCreatedAt());
    }
}
