package com.ltech.backend.domain.dtos;

import jakarta.validation.constraints.NotBlank;

/**
 * Registra a assinatura do contrato. {@code tipoAssinatura} = MANUAL (anexa
 * {@code urlDocumento} do escaneado) ou DIGITAL (anexa {@code assinaturaUrl} do pad).
 */
public record SalvarContratoDTO(
        @NotBlank String tipoAssinatura,
        String urlDocumento,
        String assinaturaUrl) {
}
