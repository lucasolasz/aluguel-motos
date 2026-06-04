package com.ltech.backend.domain.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

import com.ltech.backend.domain.entities.Endereco;

public record EnderecoDTO(
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

    public static EnderecoDTO from(Endereco e) {
        return new EnderecoDTO(
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