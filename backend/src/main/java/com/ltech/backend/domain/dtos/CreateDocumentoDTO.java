package com.ltech.backend.domain.dtos;

import jakarta.validation.constraints.NotBlank;

public record CreateDocumentoDTO(
        @NotBlank String tipo,
        @NotBlank String url) {
}
