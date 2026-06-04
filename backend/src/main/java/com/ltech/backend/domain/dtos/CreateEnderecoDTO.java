package com.ltech.backend.domain.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateEnderecoDTO(
        @NotBlank @Size(max = 9) String cep,
        @NotBlank @Size(max = 255) String logradouro,
        @Size(max = 20) String numero,
        boolean semNumero,
        @Size(max = 100) String complemento,
        @NotBlank @Size(max = 2) String estado,
        @NotBlank @Size(max = 255) String cidade,
        @NotBlank @Size(max = 255) String bairro) {
}