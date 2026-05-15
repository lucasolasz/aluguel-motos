package com.ltech.backend.services;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ltech.backend.domain.dtos.CreateReservaDTO;
import com.ltech.backend.domain.dtos.ReservaDTO;
import com.ltech.backend.domain.entities.Acessorio;
import com.ltech.backend.domain.entities.Moto;
import com.ltech.backend.domain.entities.Reserva;
import com.ltech.backend.domain.entities.ReservaAcessorioItem;
import com.ltech.backend.domain.entities.Seguro;
import com.ltech.backend.domain.entities.StatusReserva;
import com.ltech.backend.domain.entities.Usuario;
import com.ltech.backend.domain.repositories.AcessorioRepository;
import com.ltech.backend.domain.repositories.MotoRepository;
import com.ltech.backend.domain.repositories.ReservaRepository;
import com.ltech.backend.domain.repositories.SeguroRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ReservaService {

    private ReservaRepository reservaRepository;
    private MotoRepository motoRepository;
    private SeguroRepository seguroRepository;
    private AcessorioRepository acessorioRepository;

    public List<ReservaDTO> listarMinhasReservas(String usuarioId) {
        return reservaRepository.findByUsuarioIdOrderByCreatedAtDesc(usuarioId)
                .stream()
                .map(ReservaDTO::from)
                .toList();
    }

    public ReservaDTO criarReserva(CreateReservaDTO dto, Usuario usuario) {
        Moto moto = motoRepository.findById(UUID.fromString(dto.motoId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Moto não encontrada"));

        if (!moto.getDisponivel()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Moto não disponível");
        }

        long dias = ChronoUnit.DAYS.between(dto.dataRetirada(), dto.dataDevolucao());
        if (dias <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Datas inválidas");
        }

        Seguro seguro = null;
        BigDecimal totalSeguro = BigDecimal.ZERO;
        if (dto.seguroId() != null && !dto.seguroId().isBlank()) {
            seguro = seguroRepository.findById(UUID.fromString(dto.seguroId()))
                    .orElse(null);
            if (seguro != null) {
                totalSeguro = seguro.getPrecoPorDia().multiply(BigDecimal.valueOf(dias));
            }
        }

        BigDecimal totalAluguel = moto.getPrecoPorDia().multiply(BigDecimal.valueOf(dias));
        BigDecimal totalAcessorios = BigDecimal.ZERO;

        Reserva reserva = Reserva.builder()
                .usuario(usuario)
                .moto(moto)
                .seguro(seguro)
                .dataRetirada(dto.dataRetirada())
                .dataDevolucao(dto.dataDevolucao())
                .totalDias((int) dias)
                .precoPorDia(moto.getPrecoPorDia())
                .caucao(moto.getCaucao())
                .totalAluguel(totalAluguel)
                .totalSeguro(totalSeguro)
                .totalAcessorios(BigDecimal.ZERO)
                .total(BigDecimal.ZERO)
                .build();

        List<ReservaAcessorioItem> items = new ArrayList<>();
        if (dto.acessorios() != null) {
            for (var itemDTO : dto.acessorios()) {
                if (itemDTO.quantidade() <= 0) continue;
                Acessorio acessorio = acessorioRepository.findById(UUID.fromString(itemDTO.acessorioId()))
                        .orElse(null);
                if (acessorio == null) continue;

                BigDecimal subtotal = acessorio.getPrecoPorDia()
                        .multiply(BigDecimal.valueOf(itemDTO.quantidade()))
                        .multiply(BigDecimal.valueOf(dias));
                totalAcessorios = totalAcessorios.add(subtotal);

                items.add(ReservaAcessorioItem.builder()
                        .reserva(reserva)
                        .acessorio(acessorio)
                        .quantidade(itemDTO.quantidade())
                        .precoPorDia(acessorio.getPrecoPorDia())
                        .build());
            }
        }

        reserva.setTotalAcessorios(totalAcessorios);
        reserva.setTotal(totalAluguel.add(totalSeguro).add(totalAcessorios));
        reserva.getAcessorios().addAll(items);

        return ReservaDTO.from(reservaRepository.save(reserva));
    }

    public ReservaDTO cancelarReserva(String reservaId, String usuarioId) {
        Reserva reserva = reservaRepository.findById(UUID.fromString(reservaId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva não encontrada"));

        if (!reserva.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão");
        }

        if (reserva.getStatus() != StatusReserva.PENDENTE && reserva.getStatus() != StatusReserva.CONFIRMADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Reserva não pode ser cancelada");
        }

        reserva.setStatus(StatusReserva.CANCELADA);
        return ReservaDTO.from(reservaRepository.save(reserva));
    }
}
