package com.ltech.backend.domain.dtos;

import java.math.BigDecimal;

/**
 * Conclui a devolução. A vistoria de retorno é registrada antes via /vistorias.
 * {@code valorDescontoCaucao} = total a capturar do hold da caução (combustível,
 * km excedente, atraso, avaria). Zero/null = libera a caução integral.
 */
public record ConcluirDevolucaoDTO(
        BigDecimal valorDescontoCaucao,
        String observacoes) {
}
