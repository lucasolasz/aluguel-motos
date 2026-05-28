package com.ltech.backend.domain.dtos;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record SeguroAdminDTO(
    UUID id,
    String nome,
    String slug,
    String descricao,
    BigDecimal valorOriginal,
    BigDecimal valorComDesconto,
    Integer percentualDesconto,
    BigDecimal valorTotalPacote,
    Integer maxParcelasSemJuros,
    Boolean recomendado,
    Boolean ativo,
    List<CoberturaDTO> coberturas
) {
    public record CoberturaDTO(UUID id, String nome, String tipo) {}
}
