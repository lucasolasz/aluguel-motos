package com.ltech.backend.domain.dtos;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CriarMultaDTO(
        @NotBlank String tipo,
        @NotBlank String descricao,
        @NotNull @Positive BigDecimal valor,
        String observacoes,
        String status) {
}
