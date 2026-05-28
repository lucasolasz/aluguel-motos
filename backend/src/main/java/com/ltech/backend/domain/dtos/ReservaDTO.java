package com.ltech.backend.domain.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import com.ltech.backend.domain.entities.LavagemServico;
import com.ltech.backend.domain.entities.Local;
import com.ltech.backend.domain.entities.Reserva;
import com.ltech.backend.domain.entities.ReservaAcessorioItem;
import com.ltech.backend.domain.entities.Seguro;

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
        SeguroResumoDTO seguro,
        List<AcessorioItemDTO> acessorios,
        LavagemResumoDTO lavagem,
        BigDecimal precoPorDia,
        BigDecimal caucao,
        BigDecimal totalAluguel,
        BigDecimal totalSeguro,
        BigDecimal totalAcessorios,
        BigDecimal totalLavagem,
        BigDecimal total,
        String cartaoNumeroMascarado,
        LocalDateTime createdAt) {

    public record MotoResumoDTO(String id, String nome, List<String> imagens) {
    }

    public record LocalResumoDTO(
            String id,
            String nome,
            String cep,
            String logradouro,
            String numero,
            String complemento,
            String bairro,
            String cidade,
            String estado) {
        public static LocalResumoDTO from(Local local) {
            if (local == null) return null;
            return new LocalResumoDTO(
                    local.getId().toString(),
                    local.getNome(),
                    local.getCep(),
                    local.getLogradouro(),
                    local.getNumero(),
                    local.getComplemento(),
                    local.getBairro(),
                    local.getCidade(),
                    local.getEstado());
        }
    }

    public record SeguroResumoDTO(String id, String nome, BigDecimal precoPorDia) {
        public static SeguroResumoDTO from(Seguro seguro) {
            if (seguro == null) return null;
            return new SeguroResumoDTO(
                    seguro.getId().toString(),
                    seguro.getNome(),
                    seguro.getPrecoPorDia());
        }
    }

    public record LavagemResumoDTO(String id, String nome, BigDecimal valor) {
        public static LavagemResumoDTO from(LavagemServico lavagem) {
            if (lavagem == null) return null;
            return new LavagemResumoDTO(
                    lavagem.getId().toString(),
                    lavagem.getNome(),
                    lavagem.getValor());
        }
    }

    public record AcessorioItemDTO(
            String id,
            String nome,
            int quantidade,
            BigDecimal precoPorDia,
            BigDecimal subtotal) {
        public static AcessorioItemDTO from(ReservaAcessorioItem item, int totalDias) {
            BigDecimal subtotal = item.getPrecoPorDia()
                    .multiply(BigDecimal.valueOf(item.getQuantidade()))
                    .multiply(BigDecimal.valueOf(totalDias));
            return new AcessorioItemDTO(
                    item.getId().toString(),
                    item.getAcessorio().getNome(),
                    item.getQuantidade(),
                    item.getPrecoPorDia(),
                    subtotal);
        }
    }

    public static ReservaDTO from(Reserva reserva) {
        List<String> imagens = reserva.getMoto().getFotos().stream()
                .map(f -> f.getUrl())
                .toList();

        String cartaoNumeroMascarado = reserva.getCartao() != null
                ? reserva.getCartao().getNumeroMascarado()
                : null;

        List<AcessorioItemDTO> acessorios = reserva.getAcessorios().stream()
                .map(item -> AcessorioItemDTO.from(item, reserva.getTotalDias()))
                .toList();

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
                SeguroResumoDTO.from(reserva.getSeguro()),
                acessorios,
                LavagemResumoDTO.from(reserva.getLavagemServico()),
                reserva.getPrecoPorDia(),
                reserva.getCaucao(),
                reserva.getTotalAluguel(),
                reserva.getTotalSeguro(),
                reserva.getTotalAcessorios(),
                reserva.getTotalLavagem(),
                reserva.getTotal(),
                cartaoNumeroMascarado,
                reserva.getCreatedAt());
    }
}
