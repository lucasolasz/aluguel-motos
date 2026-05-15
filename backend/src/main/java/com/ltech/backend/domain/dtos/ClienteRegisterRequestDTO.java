package com.ltech.backend.domain.dtos;

import jakarta.validation.constraints.NotBlank;

public record ClienteRegisterRequestDTO(
        @NotBlank String username,
        @NotBlank String password,
        @NotBlank String nomeCompleto,
        @NotBlank String email,
        @NotBlank String telefone,
        @NotBlank String cpf,
        @NotBlank String numeroCnh) {
}
