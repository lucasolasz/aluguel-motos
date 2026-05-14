package com.ltech.backend.domain.dtos;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record MotoDTO(
    UUID id,
    String nome,
    String slug,
    String marca,
    String modelo,
    Integer ano,
    BigDecimal precoPorDia,
    BigDecimal caucao,
    String motor,
    String potencia,
    String transmissao,
    String capacidadeTanque,
    String alturaAssento,
    String peso,
    String itens,
    Boolean disponivel,
    List<MotoFotoDTO> fotos,
    CategoriaDTO categoria
) {
}
