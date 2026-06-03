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
        boolean vinculadoAReservas,
        LocalDateTime createdAt) {

    public static CartaoDTO from(Cartao c) {
        return from(c, false);
    }

    public static CartaoDTO from(Cartao c, boolean vinculadoAReservas) {
        return new CartaoDTO(
                c.getId(),
                c.getNome(),
                c.getNumeroMascarado(),
                c.getValidade(),
                c.getCpf(),
                c.getEnderecoCobranca() != null ? EnderecoCobrancaDTO.from(c.getEnderecoCobranca()) : null,
                vinculadoAReservas,
                c.getCreatedAt());
    }
}
