package com.ltech.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ltech.backend.domain.entities.Categoria;
import com.ltech.backend.domain.repositories.CategoriaRepository;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    public List<Categoria> obterTodas() {
        return categoriaRepository.findAll();
    }

    public Categoria obterPorId(UUID id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada: " + id));
    }
}
