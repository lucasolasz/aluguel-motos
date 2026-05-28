package com.ltech.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ltech.backend.domain.dtos.SeguroRequestDTO;
import com.ltech.backend.domain.entities.Seguro;
import com.ltech.backend.domain.entities.SeguroCobertura;
import com.ltech.backend.domain.entities.TipoCobertura;
import com.ltech.backend.domain.repositories.SeguroRepository;

@Service
public class SeguroService {

    private final SeguroRepository seguroRepository;

    public SeguroService(SeguroRepository seguroRepository) {
        this.seguroRepository = seguroRepository;
    }

    public List<Seguro> obterTodos() {
        return seguroRepository.findAll();
    }

    public Seguro obterPorId(UUID id) {
        return seguroRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Seguro não encontrado: " + id));
    }

    public Seguro obterPorSlug(String slug) {
        return seguroRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Seguro não encontrado: " + slug));
    }

    public Seguro criar(SeguroRequestDTO dto) {
        String slug = generateSlug(dto.nome());
        Seguro seguro = Seguro.builder()
                .nome(dto.nome())
                .slug(slug)
                .descricao(dto.descricao())
                .precoPorDia(dto.valorComDesconto())
                .basico(false)
                .valorOriginal(dto.valorOriginal())
                .valorComDesconto(dto.valorComDesconto())
                .percentualDesconto(dto.percentualDesconto())
                .valorTotalPacote(dto.valorTotalPacote())
                .maxParcelasSemJuros(dto.maxParcelasSemJuros())
                .recomendado(dto.recomendado() != null ? dto.recomendado() : false)
                .ativo(dto.ativo() != null ? dto.ativo() : true)
                .build();

        if (dto.coberturas() != null) {
            for (int i = 0; i < dto.coberturas().size(); i++) {
                var req = dto.coberturas().get(i);
                SeguroCobertura cobertura = SeguroCobertura.builder()
                        .nome(req.nome())
                        .tipo(TipoCobertura.valueOf(req.tipo()))
                        .ordem(i)
                        .seguro(seguro)
                        .build();
                seguro.getCoberturas().add(cobertura);
            }
        }

        return seguroRepository.save(seguro);
    }

    public Seguro atualizar(UUID id, SeguroRequestDTO dto) {
        Seguro seguro = obterPorId(id);

        seguro.setNome(dto.nome());
        seguro.setSlug(generateSlug(dto.nome()));
        seguro.setDescricao(dto.descricao());
        seguro.setPrecoPorDia(dto.valorComDesconto());
        seguro.setValorOriginal(dto.valorOriginal());
        seguro.setValorComDesconto(dto.valorComDesconto());
        seguro.setPercentualDesconto(dto.percentualDesconto());
        seguro.setValorTotalPacote(dto.valorTotalPacote());
        seguro.setMaxParcelasSemJuros(dto.maxParcelasSemJuros());
        seguro.setRecomendado(dto.recomendado() != null ? dto.recomendado() : false);
        seguro.setAtivo(dto.ativo() != null ? dto.ativo() : true);

        seguro.getCoberturas().clear();

        if (dto.coberturas() != null) {
            for (int i = 0; i < dto.coberturas().size(); i++) {
                var req = dto.coberturas().get(i);
                SeguroCobertura cobertura = SeguroCobertura.builder()
                        .nome(req.nome())
                        .tipo(TipoCobertura.valueOf(req.tipo()))
                        .ordem(i)
                        .seguro(seguro)
                        .build();
                seguro.getCoberturas().add(cobertura);
            }
        }

        return seguroRepository.save(seguro);
    }

    public void excluir(UUID id) {
        Seguro seguro = obterPorId(id);
        seguroRepository.delete(seguro);
    }

    private String generateSlug(String nome) {
        return nome.toLowerCase()
                .replace("ã", "a").replace("â", "a").replace("á", "a").replace("à", "a")
                .replace("ê", "e").replace("é", "e").replace("è", "e")
                .replace("í", "i").replace("ì", "i")
                .replace("õ", "o").replace("ô", "o").replace("ó", "o").replace("ò", "o")
                .replace("ú", "u").replace("ù", "u")
                .replace("ç", "c")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }
}
