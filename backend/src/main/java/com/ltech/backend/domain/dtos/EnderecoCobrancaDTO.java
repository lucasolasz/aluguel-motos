package com.ltech.backend.domain.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

import com.ltech.backend.domain.entities.EnderecoCobranca;

public record EnderecoCobrancaDTO(
        UUID id,
        String cep,
        String logradouro,
        String numero,
        boolean semNumero,
        String complemento,
        String estado,
        String cidade,
        String bairro,
        LocalDateTime createdAt) {

    public static EnderecoCobrancaDTO from(EnderecoCobranca e) {
        return new EnderecoCobrancaDTO(
                e.getId(),
                e.getCep(),
                e.getLogradouro(),
                e.getNumero(),
                e.isSemNumero(),
                e.getComplemento(),
                e.getEstado(),
                e.getCidade(),
                e.getBairro(),
                e.getCreatedAt());
    }
}
