package com.ltech.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ltech.backend.domain.dtos.CategoriaRequestDTO;
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

    public Categoria criar(CategoriaRequestDTO dto) {
        Categoria categoria = Categoria.builder()
                .nome(dto.nome())
                .descricao(dto.descricao())
                .slug(dto.slug())
                .imageUrl(dto.imageUrl())
                .build();
        return categoriaRepository.save(categoria);
    }

    public Categoria atualizar(UUID id, CategoriaRequestDTO dto) {
        Categoria categoria = obterPorId(id);
        categoria.setNome(dto.nome());
        categoria.setDescricao(dto.descricao());
        categoria.setSlug(dto.slug());
        categoria.setImageUrl(dto.imageUrl());
        return categoriaRepository.save(categoria);
    }

    public void excluir(UUID id) {
        categoriaRepository.delete(obterPorId(id));
    }
}