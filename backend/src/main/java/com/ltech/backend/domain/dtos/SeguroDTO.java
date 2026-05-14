package com.ltech.backend.domain.dtos;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record SeguroDTO(
    UUID id,
    String nome,
    String slug,
    String descricao,
    BigDecimal precoPorDia,
    Boolean basico,
    List<String> coberturas
) {
}
