package com.ltech.backend.services;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ltech.backend.domain.entities.Moto;
import com.ltech.backend.domain.repositories.MotoRepository;
import com.ltech.backend.domain.repositories.ReservaRepository;

@Service
public class MotoService {

    private final MotoRepository motoRepository;
    private final ReservaRepository reservaRepository;

    public MotoService(MotoRepository motoRepository, ReservaRepository reservaRepository) {
        this.motoRepository = motoRepository;
        this.reservaRepository = reservaRepository;
    }

    public List<Moto> obterTodas() {
        return motoRepository.findAll();
    }

    public List<Moto> obterDestaques() {
        return motoRepository.findByDestaqueTrue();
    }

    public Moto obterPorId(UUID id) {
        return motoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Moto não encontrada: " + id));
    }

    public List<Moto> obterDisponiveisPorPeriodo(LocalDate inicio, LocalDate fim) {
        Set<UUID> ocupados = reservaRepository.findMotoIdsOcupados(inicio, fim)
                .stream()
                .collect(Collectors.toSet());
        return motoRepository.findAll().stream()
                .filter(m -> Boolean.TRUE.equals(m.getDisponivel()))
                .filter(m -> !ocupados.contains(m.getId()))
                .toList();
    }
}
