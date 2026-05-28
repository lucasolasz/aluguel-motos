package com.ltech.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ltech.backend.domain.dtos.AcessorioRequestDTO;
import com.ltech.backend.domain.entities.Acessorio;
import com.ltech.backend.domain.repositories.AcessorioRepository;

@Service
public class AcessorioService {

    private final AcessorioRepository acessorioRepository;

    public AcessorioService(AcessorioRepository acessorioRepository) {
        this.acessorioRepository = acessorioRepository;
    }

    public List<Acessorio> obterAtivos() {
        return acessorioRepository.findByAtivoTrue();
    }

    public List<Acessorio> obterTodos() {
        return acessorioRepository.findAll();
    }

    public Acessorio obterPorId(UUID id) {
        return acessorioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Acessório não encontrado: " + id));
    }

    public Acessorio criar(AcessorioRequestDTO dto) {
        Acessorio acessorio = Acessorio.builder()
                .nome(dto.nome())
                .descricao(dto.descricao())
                .precoPorDia(dto.precoPorDia())
                .quantidadeMaxima(dto.quantidadeMaxima())
                .ativo(dto.ativo() != null ? dto.ativo() : true)
                .build();
        return acessorioRepository.save(acessorio);
    }

    public Acessorio atualizar(UUID id, AcessorioRequestDTO dto) {
        Acessorio acessorio = obterPorId(id);
        acessorio.setNome(dto.nome());
        acessorio.setDescricao(dto.descricao());
        acessorio.setPrecoPorDia(dto.precoPorDia());
        acessorio.setQuantidadeMaxima(dto.quantidadeMaxima());
        acessorio.setAtivo(dto.ativo() != null ? dto.ativo() : true);
        return acessorioRepository.save(acessorio);
    }

    public void excluir(UUID id) {
        acessorioRepository.delete(obterPorId(id));
    }
}
