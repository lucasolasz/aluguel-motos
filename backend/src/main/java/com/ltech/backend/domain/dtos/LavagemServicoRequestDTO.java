package com.ltech.backend.domain.dtos;

import java.math.BigDecimal;

public record LavagemServicoRequestDTO(
        String nome,
        String descricao,
        BigDecimal valor,
        String tipoCobranca,
        Boolean ativo) {
}
