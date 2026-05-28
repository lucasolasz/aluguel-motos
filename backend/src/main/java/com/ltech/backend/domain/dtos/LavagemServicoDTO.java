package com.ltech.backend.domain.dtos;

import java.math.BigDecimal;
import java.util.UUID;

import com.ltech.backend.domain.entities.LavagemServico;

public record LavagemServicoDTO(
        UUID id,
        String nome,
        String descricao,
        BigDecimal valor,
        String tipoCobranca,
        Boolean ativo) {

    public static LavagemServicoDTO from(LavagemServico l) {
        return new LavagemServicoDTO(
                l.getId(),
                l.getNome(),
                l.getDescricao(),
                l.getValor(),
                l.getTipoCobranca() != null ? l.getTipoCobranca().name() : null,
                l.getAtivo());
    }
}
