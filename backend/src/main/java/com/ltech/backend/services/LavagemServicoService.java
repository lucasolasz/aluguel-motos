package com.ltech.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ltech.backend.domain.dtos.LavagemServicoRequestDTO;
import com.ltech.backend.domain.entities.LavagemServico;
import com.ltech.backend.domain.entities.TipoCobrancaLavagem;
import com.ltech.backend.domain.repositories.LavagemServicoRepository;

@Service
public class LavagemServicoService {

    private final LavagemServicoRepository lavagemServicoRepository;

    public LavagemServicoService(LavagemServicoRepository lavagemServicoRepository) {
        this.lavagemServicoRepository = lavagemServicoRepository;
    }

    public List<LavagemServico> obterAtivos() {
        return lavagemServicoRepository.findByAtivoTrue();
    }

    public List<LavagemServico> obterTodos() {
        return lavagemServicoRepository.findAll();
    }

    public LavagemServico obterPorId(UUID id) {
        return lavagemServicoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Serviço de lavagem não encontrado: " + id));
    }

    public LavagemServico criar(LavagemServicoRequestDTO dto) {
        LavagemServico lavagem = LavagemServico.builder()
                .nome(dto.nome())
                .descricao(dto.descricao())
                .valor(dto.valor())
                .tipoCobranca(parseTipo(dto.tipoCobranca()))
                .ativo(dto.ativo() != null ? dto.ativo() : true)
                .build();
        return lavagemServicoRepository.save(lavagem);
    }

    public LavagemServico atualizar(UUID id, LavagemServicoRequestDTO dto) {
        LavagemServico lavagem = obterPorId(id);
        lavagem.setNome(dto.nome());
        lavagem.setDescricao(dto.descricao());
        lavagem.setValor(dto.valor());
        lavagem.setTipoCobranca(parseTipo(dto.tipoCobranca()));
        lavagem.setAtivo(dto.ativo() != null ? dto.ativo() : true);
        return lavagemServicoRepository.save(lavagem);
    }

    public void excluir(UUID id) {
        lavagemServicoRepository.delete(obterPorId(id));
    }

    private TipoCobrancaLavagem parseTipo(String tipo) {
        if (tipo == null || tipo.isBlank()) {
            return TipoCobrancaLavagem.VALOR_UNICO;
        }
        return TipoCobrancaLavagem.valueOf(tipo);
    }
}
