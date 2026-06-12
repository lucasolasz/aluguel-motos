package com.ltech.backend.domain.dtos;

import java.math.BigDecimal;
import java.util.List;

import com.ltech.backend.domain.entities.ConfiguracaoPrecificacao;
import com.ltech.backend.domain.entities.DescontoTier;

public record ConfiguracaoPrecificacaoDTO(
        String id,
        BigDecimal janeiro,
        BigDecimal fevereiro,
        BigDecimal marco,
        BigDecimal abril,
        BigDecimal maio,
        BigDecimal junho,
        BigDecimal julho,
        BigDecimal agosto,
        BigDecimal setembro,
        BigDecimal outubro,
        BigDecimal novembro,
        BigDecimal dezembro,
        int carnavalInicioMes,
        int carnavalInicioDia,
        int carnavalFimMes,
        int carnavalFimDia,
        BigDecimal carnavalFator,
        List<DescontoTierDTO> descontoTiers) {

    public record DescontoTierDTO(String id, int min, int max, int desconto, int ordem) {
        public static DescontoTierDTO from(DescontoTier tier) {
            return new DescontoTierDTO(
                    tier.getId().toString(),
                    tier.getMin(),
                    tier.getMax(),
                    tier.getDesconto(),
                    tier.getOrdem());
        }
    }

    public static ConfiguracaoPrecificacaoDTO from(ConfiguracaoPrecificacao config) {
        List<DescontoTierDTO> tiers = config.getDescontoTiers().stream()
                .map(DescontoTierDTO::from)
                .toList();

        return new ConfiguracaoPrecificacaoDTO(
                config.getId().toString(),
                config.getJaneiro(),
                config.getFevereiro(),
                config.getMarco(),
                config.getAbril(),
                config.getMaio(),
                config.getJunho(),
                config.getJulho(),
                config.getAgosto(),
                config.getSetembro(),
                config.getOutubro(),
                config.getNovembro(),
                config.getDezembro(),
                config.getCarnavalInicioMes(),
                config.getCarnavalInicioDia(),
                config.getCarnavalFimMes(),
                config.getCarnavalFimDia(),
                config.getCarnavalFator(),
                tiers);
    }
}
