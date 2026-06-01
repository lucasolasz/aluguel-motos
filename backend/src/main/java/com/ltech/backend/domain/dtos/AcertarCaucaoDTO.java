package com.ltech.backend.domain.dtos;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;

/**
 * Acerta a caução: captura parcial/total do hold ou libera integralmente.
 * {@code valorDescontoCaucao} = total a capturar do hold (0 = liberar tudo).
 */
public record AcertarCaucaoDTO(
        @DecimalMin(value = "0", message = "Valor de desconto não pode ser negativo")
        BigDecimal valorDescontoCaucao) {
}