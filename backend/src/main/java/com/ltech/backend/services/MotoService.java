package com.ltech.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ltech.backend.domain.entities.Moto;
import com.ltech.backend.domain.repositories.MotoRepository;

@Service
public class MotoService {

    private final MotoRepository motoRepository;

    public MotoService(MotoRepository motoRepository) {
        this.motoRepository = motoRepository;
    }

    public List<Moto> obterTodas() {
        return motoRepository.findAll();
    }

    public Moto obterPorId(UUID id) {
        return motoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Moto não encontrada: " + id));
    }
}
