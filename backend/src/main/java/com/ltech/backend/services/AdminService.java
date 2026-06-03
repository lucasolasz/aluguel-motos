package com.ltech.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ltech.backend.domain.dtos.ClienteDTO;
import com.ltech.backend.domain.dtos.ReservaAdminDTO;
import com.ltech.backend.domain.entities.Reserva;
import com.ltech.backend.domain.entities.StatusReserva;
import com.ltech.backend.domain.entities.Usuario;
import com.ltech.backend.domain.repositories.ReservaRepository;
import com.ltech.backend.domain.repositories.UsuarioRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class AdminService {

    private UsuarioRepository usuarioRepository;
    private ReservaRepository reservaRepository;

    public List<ReservaAdminDTO> listarTodasReservas() {
        return listarTodasReservas(null);
    }

    public List<ReservaAdminDTO> listarTodasReservas(String cpf) {
        String filtro = cpf == null ? "" : cpf.replaceAll("\\D", "");
        return reservaRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(r -> filtro.isEmpty()
                        || (r.getUsuario().getCpf() != null
                            && r.getUsuario().getCpf().replaceAll("\\D", "").contains(filtro)))
                .map(ReservaAdminDTO::from)
                .toList();
    }

    public ReservaAdminDTO atualizarStatusReserva(String reservaId, StatusReserva novoStatus) {
        Reserva reserva = reservaRepository.findById(UUID.fromString(reservaId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva não encontrada"));

        reserva.setStatus(novoStatus);
        return ReservaAdminDTO.from(reservaRepository.save(reserva));
    }

    public List<ClienteDTO> listarClientes() {
        return usuarioRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(usuario -> {
                    int totalReservas = reservaRepository.countByUsuarioId(usuario.getId());
                    return ClienteDTO.fromMasked(usuario, totalReservas);
                })
                .toList();
    }

    public ClienteDTO buscarCliente(String id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));

        int totalReservas = reservaRepository.countByUsuarioId(usuario.getId());
        return ClienteDTO.from(usuario, totalReservas);
    }
}