package com.ltech.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ltech.backend.domain.entities.Acessorio;
import com.ltech.backend.domain.repositories.AcessorioRepository;

@Service
public class AcessorioService {

    private final AcessorioRepository acessorioRepository;

    public AcessorioService(AcessorioRepository acessorioRepository) {
        this.acessorioRepository = acessorioRepository;
    }

    public List<Acessorio> obterTodos() {
        return acessorioRepository.findAll();
    }

    public Acessorio obterPorId(UUID id) {
        return acessorioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Acessório não encontrado: " + id));
    }
}
