package com.ltech.backend.domain.dtos;

import java.util.List;

import jakarta.validation.constraints.NotBlank;

public record CriarVistoriaDTO(
        @NotBlank String tipo,
        Integer kmRegistrado,
        String nivelCombustivel,
        String observacoes,
        List<String> fotos) {
}
