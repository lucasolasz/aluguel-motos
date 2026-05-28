package com.ltech.backend.domain.dtos;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateReservaDTO(
        @NotBlank String motoId,
        @NotNull LocalDate dataRetirada,
        @NotNull LocalDate dataDevolucao,
        @NotNull LocalTime horaRetirada,
        @NotNull LocalTime horaDevolucao,
        @NotBlank String localRetiradaId,
        @NotBlank String localDevolucaoId,
        String seguroId,
        String cartaoId,
        String lavagemServicoId,
        List<AcessorioItemDTO> acessorios) {

    public record AcessorioItemDTO(
            @NotBlank String acessorioId,
            @NotNull int quantidade) {
    }
}
