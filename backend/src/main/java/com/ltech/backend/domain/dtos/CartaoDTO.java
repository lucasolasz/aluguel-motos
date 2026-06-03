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
        String bandeira,
        String apelido,
        boolean ativo,
        EnderecoCobrancaDTO enderecoCobranca,
        boolean vinculadoAReservas,
        LocalDateTime createdAt) {

    public static CartaoDTO from(Cartao c) {
        return from(c, false, c.getNome(), c.getCpf());
    }

    public static CartaoDTO from(Cartao c, boolean vinculadoAReservas) {
        return from(c, vinculadoAReservas, c.getNome(), c.getCpf());
    }

    public static CartaoDTO from(Cartao c, boolean vinculadoAReservas,
                                  String nomeDecrypted, String cpfDecrypted) {
        return new CartaoDTO(
                c.getId(),
                nomeDecrypted,
                c.getNumeroMascarado(),
                c.getValidade(),
                cpfDecrypted,
                c.getBandeira(),
                c.getApelido(),
                c.getAtivo() != null ? c.getAtivo() : true,
                c.getEnderecoCobranca() != null
                        ? EnderecoCobrancaDTO.from(c.getEnderecoCobranca()) : null,
                vinculadoAReservas,
                c.getCreatedAt());
    }
}
