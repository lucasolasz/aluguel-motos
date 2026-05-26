package com.ltech.backend.domain.dtos;

import java.util.UUID;

import com.ltech.backend.domain.entities.Local;

public record LocalDTO(
        UUID id,
        String nome,
        String cep,
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String estado,
        Boolean ativo) {

    public static LocalDTO from(Local local) {
        return new LocalDTO(
                local.getId(),
                local.getNome(),
                local.getCep(),
                local.getLogradouro(),
                local.getNumero(),
                local.getComplemento(),
                local.getBairro(),
                local.getCidade(),
                local.getEstado(),
                local.getAtivo());
    }
}
