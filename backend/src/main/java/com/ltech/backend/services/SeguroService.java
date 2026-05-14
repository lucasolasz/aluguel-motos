package com.ltech.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ltech.backend.domain.entities.Seguro;
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
}
