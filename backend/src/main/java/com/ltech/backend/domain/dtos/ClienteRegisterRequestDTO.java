package com.ltech.backend.domain.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClienteRegisterRequestDTO(
        @NotBlank String username,
        @NotBlank @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres") String password,
        @NotBlank String nomeCompleto,
        @NotBlank String telefone,
        @NotBlank String cpf,
        @NotBlank String numeroCnh) {
}
