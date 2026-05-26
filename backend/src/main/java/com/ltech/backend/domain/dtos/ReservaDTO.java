package com.ltech.backend.domain.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import com.ltech.backend.domain.entities.Local;
import com.ltech.backend.domain.entities.Reserva;

public record ReservaDTO(
        String id,
        String status,
        LocalDate dataRetirada,
        LocalDate dataDevolucao,
        LocalTime horaRetirada,
        LocalTime horaDevolucao,
        LocalResumoDTO localRetirada,
        LocalResumoDTO localDevolucao,
        int totalDias,
        MotoResumoDTO moto,
        BigDecimal precoPorDia,
        BigDecimal caucao,
        BigDecimal totalAluguel,
        BigDecimal totalSeguro,
        BigDecimal totalAcessorios,
        BigDecimal total,
        String cartaoNumeroMascarado,
        LocalDateTime createdAt) {

    public record MotoResumoDTO(String id, String nome, List<String> imagens) {
    }

    public record LocalResumoDTO(String id, String nome, String cidade, String estado) {
        public static LocalResumoDTO from(Local local) {
            if (local == null) return null;
            return new LocalResumoDTO(
                    local.getId().toString(),
                    local.getNome(),
                    local.getCidade(),
                    local.getEstado());
        }
    }

    public static ReservaDTO from(Reserva reserva) {
        List<String> imagens = reserva.getMoto().getFotos().stream()
                .map(f -> f.getUrl())
                .toList();

        String cartaoNumeroMascarado = reserva.getCartao() != null
                ? reserva.getCartao().getNumeroMascarado()
                : null;

        return new ReservaDTO(
                reserva.getId().toString(),
                reserva.getStatus().name(),
                reserva.getDataRetirada(),
                reserva.getDataDevolucao(),
                reserva.getHoraRetirada(),
                reserva.getHoraDevolucao(),
                LocalResumoDTO.from(reserva.getLocalRetirada()),
                LocalResumoDTO.from(reserva.getLocalDevolucao()),
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
                cartaoNumeroMascarado,
                reserva.getCreatedAt());
    }
}
