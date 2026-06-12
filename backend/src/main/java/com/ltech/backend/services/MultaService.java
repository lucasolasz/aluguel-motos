package com.ltech.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ltech.backend.domain.dtos.CriarMultaDTO;
import com.ltech.backend.domain.dtos.MultaDTO;
import com.ltech.backend.domain.entities.Multa;
import com.ltech.backend.domain.entities.Reserva;
import com.ltech.backend.domain.entities.StatusMulta;
import com.ltech.backend.domain.entities.TipoMulta;
import com.ltech.backend.domain.repositories.MultaRepository;
import com.ltech.backend.domain.repositories.ReservaRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class MultaService {

    private final MultaRepository multaRepository;
    private final ReservaRepository reservaRepository;

    @Transactional
    public MultaDTO criarMulta(String reservaId, CriarMultaDTO dto, String adminNome) {
        Reserva reserva = carregarReserva(reservaId);
        TipoMulta tipo = parseEnum(TipoMulta.class, dto.tipo(), "tipo");

        Multa multa = Multa.builder()
                .reserva(reserva)
                .tipo(tipo)
                .descricao(dto.descricao())
                .valor(dto.valor())
                .status(StatusMulta.PENDENTE)
                .observacoes(dto.observacoes())
                .criadoPor(adminNome)
                .build();

        return MultaDTO.from(multaRepository.save(multa));
    }

    @Transactional
    public MultaDTO editarMulta(String reservaId, String multaId, CriarMultaDTO dto) {
        Multa multa = carregarMultaDaReserva(reservaId, multaId);

        if (dto.tipo() != null && !dto.tipo().isBlank()) {
            multa.setTipo(parseEnum(TipoMulta.class, dto.tipo(), "tipo"));
        }
        if (dto.descricao() != null && !dto.descricao().isBlank()) {
            multa.setDescricao(dto.descricao());
        }
        if (dto.valor() != null) {
            multa.setValor(dto.valor());
        }
        if (dto.observacoes() != null) {
            multa.setObservacoes(dto.observacoes());
        }
        if (dto.status() != null && !dto.status().isBlank()) {
            multa.setStatus(parseEnum(StatusMulta.class, dto.status(), "status"));
        }

        return MultaDTO.from(multaRepository.save(multa));
    }

    @Transactional
    public void cancelarMulta(String reservaId, String multaId) {
        Multa multa = carregarMultaDaReserva(reservaId, multaId);
        multa.setStatus(StatusMulta.CANCELADA);
        multaRepository.save(multa);
    }

    @Transactional(readOnly = true)
    public List<MultaDTO> listarPorReserva(String reservaId) {
        UUID uuid = parseUuid(reservaId);
        return multaRepository.findByReservaIdOrderByCreatedAtAsc(uuid)
                .stream().map(MultaDTO::from).toList();
    }

    @Transactional(readOnly = true)
    public List<MultaDTO> listarTodas() {
        return multaRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(MultaDTO::from).toList();
    }

    @Transactional(readOnly = true)
    public List<MultaDTO> listarPorReservaParaCliente(String reservaId, UUID usuarioId) {
        UUID uuid = parseUuid(reservaId);
        Reserva reserva = reservaRepository.findById(uuid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva não encontrada"));
        if (!reserva.getUsuario().getId().equals(usuarioId.toString())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
        return multaRepository.findByReservaIdOrderByCreatedAtAsc(uuid)
                .stream().map(MultaDTO::from).toList();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Reserva carregarReserva(String id) {
        return reservaRepository.findById(parseUuid(id))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva não encontrada"));
    }

    private Multa carregarMultaDaReserva(String reservaId, String multaId) {
        Multa multa = multaRepository.findById(parseUuid(multaId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Multa não encontrada"));
        if (!multa.getReserva().getId().toString().equals(reservaId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Multa não pertence a esta reserva");
        }
        return multa;
    }

    private UUID parseUuid(String id) {
        try {
            return UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id inválido");
        }
    }

    private <E extends Enum<E>> E parseEnum(Class<E> type, String value, String field) {
        try {
            return Enum.valueOf(type, value.trim().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " inválido: " + value);
        }
    }
}
