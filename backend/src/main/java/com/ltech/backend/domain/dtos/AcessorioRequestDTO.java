package com.ltech.backend.domain.dtos;

import java.math.BigDecimal;

public record AcessorioRequestDTO(
    String nome,
    String descricao,
    BigDecimal precoPorDia,
    Integer quantidadeMaxima,
    Boolean ativo
) {
}
