package com.ltech.backend.domain.dtos;

import java.time.LocalDateTime;
import java.util.List;

import com.ltech.backend.domain.entities.Vistoria;

public record VistoriaDTO(
        String id,
        String tipo,
        Integer kmRegistrado,
        String nivelCombustivel,
        String observacoes,
        List<FotoDTO> fotos,
        LocalDateTime createdAt) {

    public record FotoDTO(String id, String url, Integer ordem) {
    }

    public static VistoriaDTO from(Vistoria v) {
        List<FotoDTO> fotos = v.getFotos().stream()
                .map(f -> new FotoDTO(f.getId().toString(), f.getUrl(), f.getOrdem()))
                .toList();

        return new VistoriaDTO(
                v.getId().toString(),
                v.getTipo().name(),
                v.getKmRegistrado(),
                v.getNivelCombustivel() != null ? v.getNivelCombustivel().name() : null,
                v.getObservacoes(),
                fotos,
                v.getCreatedAt());
    }
}
