package com.ltech.backend.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.MonthDay;

import org.springframework.stereotype.Service;

import com.ltech.backend.domain.entities.ConfiguracaoPrecificacao;
import com.ltech.backend.domain.entities.DescontoTier;
import com.ltech.backend.domain.entities.TipoQuilometragem;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class PrecificacaoService {

    private static final BigDecimal MULT_ILIMITADA = new BigDecimal("1.25");

    private final ConfiguracaoPrecificacaoService configService;

    public ConfiguracaoPrecificacao obterConfigAtual() {
        return configService.obterOuCriarDefault();
    }

    public BigDecimal calcularDiariaEfetiva(BigDecimal precoBase, int dias,
                                             LocalDate dataRetirada, TipoQuilometragem tipo) {
        ConfiguracaoPrecificacao config = configService.obterOuCriarDefault();

        BigDecimal diaria = precoBase
                .multiply(fatorDesconto(dias, config))
                .multiply(fatorSazonal(dataRetirada, config));

        if (tipo == TipoQuilometragem.ILIMITADA) {
            diaria = diaria.multiply(MULT_ILIMITADA);
        }

        return diaria.setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal fatorDesconto(int dias, ConfiguracaoPrecificacao config) {
        return config.getDescontoTiers().stream()
                .filter(t -> dias >= t.getMin() && dias <= t.getMax())
                .findFirst()
                .map(t -> BigDecimal.ONE.subtract(BigDecimal.valueOf(t.getDesconto()).movePointLeft(2)))
                .orElse(BigDecimal.ONE);
    }

    public BigDecimal fatorSazonal(LocalDate data, ConfiguracaoPrecificacao config) {
        if (isCarnaval(data, config)) {
            return config.getCarnavalFator();
        }
        return getFatorMes(data.getMonthValue(), config);
    }

    private BigDecimal getFatorMes(int mes, ConfiguracaoPrecificacao config) {
        return switch (mes) {
            case 1 -> config.getJaneiro();
            case 2 -> config.getFevereiro();
            case 3 -> config.getMarco();
            case 4 -> config.getAbril();
            case 5 -> config.getMaio();
            case 6 -> config.getJunho();
            case 7 -> config.getJulho();
            case 8 -> config.getAgosto();
            case 9 -> config.getSetembro();
            case 10 -> config.getOutubro();
            case 11 -> config.getNovembro();
            case 12 -> config.getDezembro();
            default -> BigDecimal.ONE;
        };
    }

    private boolean isCarnaval(LocalDate data, ConfiguracaoPrecificacao config) {
        MonthDay md = MonthDay.from(data);
        MonthDay inicio = MonthDay.of(config.getCarnavalInicioMes(), config.getCarnavalInicioDia());
        MonthDay fim = MonthDay.of(config.getCarnavalFimMes(), config.getCarnavalFimDia());
        return !md.isBefore(inicio) && !md.isAfter(fim);
    }
}
