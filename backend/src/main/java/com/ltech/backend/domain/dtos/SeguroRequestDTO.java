package com.ltech.backend.domain.dtos;

import java.math.BigDecimal;
import java.util.List;

public record SeguroRequestDTO(
    String nome,
    String descricao,
    BigDecimal valorOriginal,
    BigDecimal valorComDesconto,
    Integer percentualDesconto,
    BigDecimal valorTotalPacote,
    Integer maxParcelasSemJuros,
    Boolean recomendado,
    Boolean ativo,
    List<CoberturaRequest> coberturas
) {
    public record CoberturaRequest(String nome, String tipo) {}
}
