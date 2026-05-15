package com.ltech.backend.domain.dtos;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateReservaDTO(
        @NotBlank String motoId,
        @NotNull LocalDate dataRetirada,
        @NotNull LocalDate dataDevolucao,
        String seguroId,
        List<AcessorioItemDTO> acessorios) {

    public record AcessorioItemDTO(
            @NotBlank String acessorioId,
            @NotNull int quantidade) {
    }
}
