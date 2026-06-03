package com.ltech.backend.domain.dtos;

import jakarta.validation.constraints.NotBlank;

public record CreateCartaoDTO(
        @NotBlank String nome,
        @NotBlank String cpf,
        @NotBlank String numero,
        String validade) {
}
