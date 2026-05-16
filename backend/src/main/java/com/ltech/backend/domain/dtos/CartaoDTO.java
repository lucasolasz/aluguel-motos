package com.ltech.backend.domain.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

import com.ltech.backend.domain.entities.Cartao;

public record CartaoDTO(
        UUID id,
        String nome,
        String numeroMascarado,
        String validade,
        String cpf,
        EnderecoCobrancaDTO enderecoCobranca,
        LocalDateTime createdAt) {

    public static CartaoDTO from(Cartao c) {
        return new CartaoDTO(
                c.getId(),
                c.getNome(),
                c.getNumeroMascarado(),
                c.getValidade(),
                c.getCpf(),
                c.getEnderecoCobranca() != null ? EnderecoCobrancaDTO.from(c.getEnderecoCobranca()) : null,
                c.getCreatedAt());
    }
}
