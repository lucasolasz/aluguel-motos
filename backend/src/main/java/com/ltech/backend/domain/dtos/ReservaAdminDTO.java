package com.ltech.backend.domain.dtos;

import com.ltech.backend.domain.entities.Reserva;

public record ReservaAdminDTO(
        String id,
        String status,
        java.time.LocalDate dataRetirada,
        java.time.LocalDate dataDevolucao,
        int totalDias,
        MotoResumoDTO moto,
        ClienteResumoDTO cliente,
        java.math.BigDecimal precoPorDia,
        java.math.BigDecimal caucao,
        java.math.BigDecimal totalAluguel,
        java.math.BigDecimal totalSeguro,
        java.math.BigDecimal totalAcessorios,
        java.math.BigDecimal total,
        String cartaoNumeroMascarado,
        java.time.LocalDateTime createdAt) {

    public record MotoResumoDTO(String id, String nome, java.util.List<String> imagens) {
    }

    public record ClienteResumoDTO(String id, String nome, String email) {
    }

    public static ReservaAdminDTO from(Reserva reserva) {
        java.util.List<String> imagens = reserva.getMoto().getFotos().stream()
                .map(f -> f.getUrl())
                .toList();

        String cartaoNumeroMascarado = reserva.getCartao() != null
                ? reserva.getCartao().getNumeroMascarado()
                : null;

        return new ReservaAdminDTO(
                reserva.getId().toString(),
                reserva.getStatus().name(),
                reserva.getDataRetirada(),
                reserva.getDataDevolucao(),
                reserva.getTotalDias(),
                new MotoResumoDTO(
                        reserva.getMoto().getId().toString(),
                        reserva.getMoto().getNome(),
                        imagens),
                new ClienteResumoDTO(
                        reserva.getUsuario().getId(),
                        reserva.getUsuario().getNomeCompleto(),
                        reserva.getUsuario().getUsername()),
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