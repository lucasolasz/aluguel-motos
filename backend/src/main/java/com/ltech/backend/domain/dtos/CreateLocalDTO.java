package com.ltech.backend.domain.dtos;

import jakarta.validation.constraints.NotBlank;

public record CreateLocalDTO(
        @NotBlank String nome,
        @NotBlank String cep,
        @NotBlank String logradouro,
        @NotBlank String numero,
        String complemento,
        @NotBlank String bairro,
        @NotBlank String cidade,
        @NotBlank String estado,
        Boolean ativo) {
}
