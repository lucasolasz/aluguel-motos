package com.ltech.backend.domain.dtos;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateCnhDTO(
        @NotBlank String rg,
        @NotNull LocalDate dataNascimento,
        @NotBlank String numeroRegistro,
        @NotBlank String numeroCnh,
        @NotNull LocalDate dataValidade,
        @NotBlank String estado) {
}
