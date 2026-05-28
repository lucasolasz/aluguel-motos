package com.ltech.backend.domain.dtos;

import java.math.BigDecimal;
import java.util.UUID;

import com.ltech.backend.domain.entities.Acessorio;

public record AcessorioDTO(
    UUID id,
    String nome,
    String descricao,
    BigDecimal precoPorDia,
    Integer quantidadeMaxima,
    Boolean ativo
) {
    public static AcessorioDTO from(Acessorio a) {
        return new AcessorioDTO(
            a.getId(),
            a.getNome(),
            a.getDescricao(),
            a.getPrecoPorDia(),
            a.getQuantidadeMaxima(),
            a.getAtivo()
        );
    }
}
