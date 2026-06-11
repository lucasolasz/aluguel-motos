package com.ltech.backend.services;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
        if (configs.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                "Configuração de precificação não encontrada. Execute o data.sql.");
        }
        return configs.get(0);
    }
}
