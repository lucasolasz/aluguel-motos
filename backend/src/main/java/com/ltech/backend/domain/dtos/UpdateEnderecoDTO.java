package com.ltech.backend.domain.dtos;

import jakarta.validation.constraints.Size;

public record UpdateEnderecoDTO(
        @Size(max = 9) String cep,
        @Size(max = 255) String logradouro,
        @Size(max = 20) String numero,
        Boolean semNumero,
        @Size(max = 100) String complemento,
        @Size(max = 2) String estado,
        @Size(max = 255) String cidade,
        @Size(max = 255) String bairro) {
}