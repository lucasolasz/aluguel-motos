package com.ltech.backend.domain.dtos;

import java.time.LocalDateTime;

import com.ltech.backend.domain.entities.Documento;

public record DocumentoDTO(
        String id,
        String tipo,
        String url,
        String status,
        LocalDateTime createdAt) {

    public static DocumentoDTO from(Documento doc) {
        return new DocumentoDTO(
                doc.getId().toString(),
                doc.getTipo().name(),
                doc.getUrl(),
                doc.getStatus().name(),
                doc.getCreatedAt());
    }
}
