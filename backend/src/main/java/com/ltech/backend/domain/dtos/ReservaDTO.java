package com.ltech.backend.domain.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.ltech.backend.domain.entities.Reserva;

public record ReservaDTO(
        String id,
        String status,
        LocalDate dataRetirada,
        LocalDate dataDevolucao,
        int totalDias,
        MotoResumoDTO moto,
        BigDecimal precoPorDia,
        BigDecimal caucao,
        BigDecimal totalAluguel,
        BigDecimal totalSeguro,
        BigDecimal totalAcessorios,
        BigDecimal total,
        LocalDateTime createdAt) {

    public record MotoResumoDTO(String id, String nome, List<String> imagens) {
    }

    public static ReservaDTO from(Reserva reserva) {
        List<String> imagens = reserva.getMoto().getFotos().stream()
                .map(f -> f.getUrl())
                .toList();

        return new ReservaDTO(
                reserva.getId().toString(),
                reserva.getStatus().name(),
                reserva.getDataRetirada(),
                reserva.getDataDevolucao(),
                reserva.getTotalDias(),
                new MotoResumoDTO(
                        reserva.getMoto().getId().toString(),
                        reserva.getMoto().getNome(),
                        imagens),
                reserva.getPrecoPorDia(),
                reserva.getCaucao(),
                reserva.getTotalAluguel(),
                reserva.getTotalSeguro(),
                reserva.getTotalAcessorios(),
                reserva.getTotal(),
                reserva.getCreatedAt());
    }
}
