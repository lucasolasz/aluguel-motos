package com.ltech.backend.domain.dtos;

import jakarta.validation.constraints.NotBlank;

public record CreateCartaoDTO(
        @NotBlank String nome,
        @NotBlank String numero,
        @NotBlank String validade,
        @NotBlank String cpf) {
}
