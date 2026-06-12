package com.ltech.backend.domain.dtos;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.NotNull;

public record ConfiguracaoPrecificacaoRequestDTO(
        @NotNull BigDecimal janeiro,
        @NotNull BigDecimal fevereiro,
        @NotNull BigDecimal marco,
        @NotNull BigDecimal abril,
        @NotNull BigDecimal maio,
        @NotNull BigDecimal junho,
        @NotNull BigDecimal julho,
        @NotNull BigDecimal agosto,
        @NotNull BigDecimal setembro,
        @NotNull BigDecimal outubro,
        @NotNull BigDecimal novembro,
        @NotNull BigDecimal dezembro,
        int carnavalInicioMes,
        int carnavalInicioDia,
        int carnavalFimMes,
        int carnavalFimDia,
        @NotNull BigDecimal carnavalFator,
        @NotNull List<DescontoTierRequestDTO> descontoTiers) {

    public record DescontoTierRequestDTO(
            int min,
            int max,
            int desconto,
            int ordem) {
    }
}
