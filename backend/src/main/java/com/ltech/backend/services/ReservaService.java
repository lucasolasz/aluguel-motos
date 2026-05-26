package com.ltech.backend.services;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
import com.ltech.backend.domain.entities.Cartao;
import com.ltech.backend.domain.entities.Local;
import com.ltech.backend.domain.entities.Moto;
import com.ltech.backend.domain.entities.Reserva;
import com.ltech.backend.domain.entities.ReservaAcessorioItem;
import com.ltech.backend.domain.entities.Seguro;
import com.ltech.backend.domain.entities.StatusReserva;
import com.ltech.backend.domain.entities.Usuario;
import com.ltech.backend.domain.repositories.AcessorioRepository;
import com.ltech.backend.domain.repositories.CartaoRepository;
import com.ltech.backend.domain.repositories.LocalRepository;
import com.ltech.backend.domain.repositories.MotoRepository;
import com.ltech.backend.domain.repositories.ReservaRepository;
import com.ltech.backend.domain.repositories.SeguroRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ReservaService {

    private static final int MAX_PENDENTES_POR_USUARIO = 5;

    private ReservaRepository reservaRepository;
    private MotoRepository motoRepository;
    private SeguroRepository seguroRepository;
    private AcessorioRepository acessorioRepository;
    private CartaoRepository cartaoRepository;
    private LocalRepository localRepository;

    public List<ReservaDTO> listarMinhasReservas(String usuarioId) {
        return reservaRepository.findByUsuarioIdOrderByCreatedAtDesc(usuarioId)
                .stream()
                .map(ReservaDTO::from)
                .toList();
    }

    public ReservaDTO criarReserva(CreateReservaDTO dto, Usuario usuario) {
        validarDatasEHorarios(dto.dataRetirada(), dto.dataDevolucao(),
                dto.horaRetirada(), dto.horaDevolucao());

        if (reservaRepository.countPendentesByUsuario(usuario.getId()) >= MAX_PENDENTES_POR_USUARIO) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Limite de reservas pendentes atingido");
        }

        Moto moto = motoRepository.findById(parseUuid(dto.motoId(), "motoId"))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Moto não encontrada"));

        if (!Boolean.TRUE.equals(moto.getDisponivel())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Moto não disponível");
        }

        long dias = Math.max(1, ChronoUnit.DAYS.between(dto.dataRetirada(), dto.dataDevolucao()));

        List<Reserva> conflitos = reservaRepository.findOverlapping(
                moto.getId(), dto.dataRetirada(), dto.dataDevolucao());
        if (!conflitos.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Moto indisponível no período");
        }

        Local localRetirada = buscarLocalAtivo(dto.localRetiradaId(), "retirada");
        Local localDevolucao = buscarLocalAtivo(dto.localDevolucaoId(), "devolução");

        Seguro seguro = null;
        BigDecimal totalSeguro = BigDecimal.ZERO;
        if (dto.seguroId() != null && !dto.seguroId().isBlank()) {
            seguro = seguroRepository.findById(parseUuid(dto.seguroId(), "seguroId"))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seguro não encontrado"));
            totalSeguro = seguro.getPrecoPorDia().multiply(BigDecimal.valueOf(dias));
        }

        BigDecimal totalAluguel = moto.getPrecoPorDia().multiply(BigDecimal.valueOf(dias));
        BigDecimal totalAcessorios = BigDecimal.ZERO;

        Cartao cartao = null;
        if (dto.cartaoId() != null && !dto.cartaoId().isBlank()) {
            cartao = cartaoRepository.findById(parseUuid(dto.cartaoId(), "cartaoId"))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cartão não encontrado"));
            if (!cartao.getUsuario().getId().equals(usuario.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cartão não pertence ao usuário");
            }
        }

        Reserva reserva = Reserva.builder()
                .usuario(usuario)
                .moto(moto)
                .seguro(seguro)
                .cartao(cartao)
                .dataRetirada(dto.dataRetirada())
                .dataDevolucao(dto.dataDevolucao())
                .horaRetirada(dto.horaRetirada())
                .horaDevolucao(dto.horaDevolucao())
                .localRetirada(localRetirada)
                .localDevolucao(localDevolucao)
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
                Acessorio acessorio = acessorioRepository.findById(parseUuid(itemDTO.acessorioId(), "acessorioId"))
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Acessório não encontrado"));

                if (acessorio.getQuantidadeMaxima() != null
                        && itemDTO.quantidade() > acessorio.getQuantidadeMaxima()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Quantidade excede o máximo permitido para o acessório " + acessorio.getNome());
                }

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
        Reserva reserva = reservaRepository.findById(parseUuid(reservaId, "reservaId"))
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

    private void validarDatasEHorarios(LocalDate dataRetirada, LocalDate dataDevolucao,
                                       LocalTime horaRetirada, LocalTime horaDevolucao) {
        LocalDate hoje = LocalDate.now();
        if (dataRetirada.isBefore(hoje)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data de retirada não pode ser no passado");
        }
        if (dataDevolucao.isBefore(dataRetirada)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Data de devolução não pode ser anterior à retirada");
        }
        if (ChronoUnit.DAYS.between(dataRetirada, dataDevolucao) > 365) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Período máximo de reserva é 365 dias");
        }
        if (!horarioValido(horaRetirada)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Horário de retirada inválido (06:00 às 23:00, slots de 30 min)");
        }
        if (!horarioValido(horaDevolucao)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Horário de devolução inválido (06:00 às 23:00, slots de 30 min)");
        }
        if (dataRetirada.equals(hoje)) {
            LocalDateTime retirada = LocalDateTime.of(dataRetirada, horaRetirada);
            if (retirada.isBefore(LocalDateTime.now())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Horário de retirada já passou");
            }
        }
        LocalDateTime inicio = LocalDateTime.of(dataRetirada, horaRetirada);
        LocalDateTime fim = LocalDateTime.of(dataDevolucao, horaDevolucao);
        Duration duracao = Duration.between(inicio, fim);
        if (duracao.toMinutes() < 60) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Duração mínima da reserva é 1 hora");
        }
    }

    private boolean horarioValido(LocalTime hora) {
        if (hora == null) return false;
        if (hora.getMinute() != 0 && hora.getMinute() != 30) return false;
        if (hora.getSecond() != 0 || hora.getNano() != 0) return false;
        int h = hora.getHour();
        if (h < 6 || h > 23) return false;
        if (h == 23 && hora.getMinute() != 0) return false;
        return true;
    }

    private Local buscarLocalAtivo(String idStr, String tipo) {
        Local local = localRepository.findById(parseUuid(idStr, "localId"))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Local de " + tipo + " não encontrado"));
        if (!Boolean.TRUE.equals(local.getAtivo())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Local de " + tipo + " indisponível");
        }
        return local;
    }

    private UUID parseUuid(String value, String field) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " inválido");
        }
    }
}
