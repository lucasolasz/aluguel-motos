package com.ltech.backend.domain.dtos;

import com.ltech.backend.domain.entities.Genero;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record ClienteRegisterRequestDTO(
        @NotBlank @Email String username,
        @NotBlank
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{10,}$",
                message = "Senha não atende aos requisitos de segurança") String password,
        @NotBlank String nomeCompleto,
        @NotBlank String telefone,
        @NotBlank String cpf,
        @NotNull Genero genero) {
}
