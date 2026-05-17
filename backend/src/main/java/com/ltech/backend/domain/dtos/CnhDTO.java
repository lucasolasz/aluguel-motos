package com.ltech.backend.domain.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.ltech.backend.domain.entities.Cnh;

public record CnhDTO(
        String id,
        String rg,
        LocalDate dataNascimento,
        String numeroRegistro,
        String numeroCnh,
        LocalDate dataValidade,
        String estado,
        LocalDateTime createdAt) {

    public static CnhDTO from(Cnh cnh) {
        return new CnhDTO(
                cnh.getId().toString(),
                cnh.getRg(),
                cnh.getDataNascimento(),
                cnh.getNumeroRegistro(),
                cnh.getNumeroCnh(),
                cnh.getDataValidade(),
                cnh.getEstado(),
                cnh.getCreatedAt());
    }
}
