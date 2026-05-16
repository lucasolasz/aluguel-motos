package com.ltech.backend.domain.dtos;

import jakarta.validation.constraints.NotBlank;

public record CreateEnderecoCobrancaDTO(
        @NotBlank String cep,
        @NotBlank String logradouro,
        String numero,
        boolean semNumero,
        String complemento,
        @NotBlank String estado,
        @NotBlank String cidade,
        @NotBlank String bairro) {
}
