package com.ltech.backend.domain.dtos;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;

/**
 * Conclui a devolução. A vistoria de retorno é registrada antes via /vistorias.
 * {@code valorDescontoCaucao} = total a capturar do hold da caução (combustível,
 * km excedente, atraso, avaria). Zero/null = libera a caução integral.
 */
public record ConcluirDevolucaoDTO(
        @DecimalMin(value = "0", message = "Valor de desconto não pode ser negativo")
        BigDecimal valorDescontoCaucao,
        String observacoes) {
}
