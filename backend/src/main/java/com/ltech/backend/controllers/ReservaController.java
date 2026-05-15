package com.ltech.backend.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ltech.backend.domain.dtos.CreateReservaDTO;
import com.ltech.backend.domain.dtos.ReservaDTO;
import com.ltech.backend.security.UsuarioDetails;
import com.ltech.backend.services.ReservaService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/reservas")
@AllArgsConstructor
public class ReservaController {

    private ReservaService reservaService;

    @GetMapping("/me")
    public ResponseEntity<List<ReservaDTO>> listarMinhasReservas(
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(
                reservaService.listarMinhasReservas(userDetails.getUsuario().getId()));
    }

    @PostMapping
    public ResponseEntity<ReservaDTO> criarReserva(
            @RequestBody @Valid CreateReservaDTO dto,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        ReservaDTO reserva = reservaService.criarReserva(dto, userDetails.getUsuario());
        return ResponseEntity.status(HttpStatus.CREATED).body(reserva);
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<ReservaDTO> cancelarReserva(
            @PathVariable String id,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(
                reservaService.cancelarReserva(id, userDetails.getUsuario().getId()));
    }
}
