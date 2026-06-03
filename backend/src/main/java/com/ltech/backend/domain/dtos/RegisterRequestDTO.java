package com.ltech.backend.domain.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequestDTO(
        @NotBlank(message = "The username is empty") String username,
        @NotBlank(message = "The password is empty") @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres") String password,
        @NotNull(message = "The enabled is empty") boolean enabled,
        @NotBlank(message = "The group Id is empty") String grupoId) {
}
