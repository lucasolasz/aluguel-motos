package com.ltech.backend.domain.dtos;

import java.math.BigDecimal;
import java.util.UUID;

public record AcessorioDTO(
    UUID id,
    String nome,
    String descricao,
    BigDecimal precoPorDia,
    Integer quantidadeMaxima
) {
}
