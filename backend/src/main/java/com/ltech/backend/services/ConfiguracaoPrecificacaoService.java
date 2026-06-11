package com.ltech.backend.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ltech.backend.domain.dtos.ConfiguracaoPrecificacaoDTO;
import com.ltech.backend.domain.dtos.ConfiguracaoPrecificacaoRequestDTO;
import com.ltech.backend.domain.entities.ConfiguracaoPrecificacao;
import com.ltech.backend.domain.entities.DescontoTier;
import com.ltech.backend.domain.repositories.ConfiguracaoPrecificacaoRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ConfiguracaoPrecificacaoService {

    private final ConfiguracaoPrecificacaoRepository repository;

    public ConfiguracaoPrecificacaoDTO obter() {
        return ConfiguracaoPrecificacaoDTO.from(obterOuCriarDefault());
    }

    @Transactional
    public ConfiguracaoPrecificacaoDTO salvar(ConfiguracaoPrecificacaoRequestDTO dto) {
        ConfiguracaoPrecificacao config = obterOuCriarDefault();

        config.setJaneiro(dto.janeiro());
        config.setFevereiro(dto.fevereiro());
        config.setMarco(dto.marco());
        config.setAbril(dto.abril());
        config.setMaio(dto.maio());
        config.setJunho(dto.junho());
        config.setJulho(dto.julho());
        config.setAgosto(dto.agosto());
        config.setSetembro(dto.setembro());
        config.setOutubro(dto.outubro());
        config.setNovembro(dto.novembro());
        config.setDezembro(dto.dezembro());

        config.setCarnavalInicioMes(dto.carnavalInicioMes());
        config.setCarnavalInicioDia(dto.carnavalInicioDia());
        config.setCarnavalFimMes(dto.carnavalFimMes());
        config.setCarnavalFimDia(dto.carnavalFimDia());
        config.setCarnavalFator(dto.carnavalFator());

        config.getDescontoTiers().clear();
        for (var tierDTO : dto.descontoTiers()) {
            DescontoTier tier = DescontoTier.builder()
                    .min(tierDTO.min())
                    .max(tierDTO.max())
                    .desconto(tierDTO.desconto())
                    .ordem(tierDTO.ordem())
                    .configuracao(config)
                    .build();
            config.getDescontoTiers().add(tier);
        }

        return ConfiguracaoPrecificacaoDTO.from(repository.save(config));
    }

    public ConfiguracaoPrecificacao obterOuCriarDefault() {
        List<ConfiguracaoPrecificacao> configs = repository.findAll();
        if (!configs.isEmpty()) {
            return configs.get(0);
        }

        ConfiguracaoPrecificacao config = ConfiguracaoPrecificacao.builder().build();
        config = repository.save(config);

        List<DescontoTier> tiersDefault = List.of(
                DescontoTier.builder().min(1).max(2).desconto(0).ordem(0).configuracao(config).build(),
                DescontoTier.builder().min(3).max(4).desconto(10).ordem(1).configuracao(config).build(),
                DescontoTier.builder().min(5).max(7).desconto(20).ordem(2).configuracao(config).build(),
                DescontoTier.builder().min(8).max(999).desconto(30).ordem(3).configuracao(config).build());

        config.getDescontoTiers().addAll(tiersDefault);
        return repository.save(config);
    }
}
