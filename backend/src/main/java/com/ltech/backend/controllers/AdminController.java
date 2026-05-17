package com.ltech.backend.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ltech.backend.domain.dtos.ClienteDTO;
import com.ltech.backend.domain.dtos.ReservaAdminDTO;
import com.ltech.backend.domain.dtos.UpdateReservaStatusDTO;
import com.ltech.backend.domain.entities.StatusReserva;
import com.ltech.backend.security.UsuarioDetails;
import com.ltech.backend.services.AdminService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@AllArgsConstructor
public class AdminController {

    private AdminService adminService;

    @GetMapping("/reservas")
    public ResponseEntity<List<ReservaAdminDTO>> listarTodasReservas(
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(adminService.listarTodasReservas());
    }

    @PatchMapping("/reservas/{id}/status")
    public ResponseEntity<ReservaAdminDTO> atualizarStatusReserva(
            @PathVariable String id,
            @RequestBody UpdateReservaStatusDTO dto,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        StatusReserva novoStatus = StatusReserva.valueOf(dto.status());
        return ResponseEntity.ok(adminService.atualizarStatusReserva(id, novoStatus));
    }

    @GetMapping("/clientes")
    public ResponseEntity<List<ClienteDTO>> listarClientes(
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(adminService.listarClientes());
    }

    @GetMapping("/clientes/{id}")
    public ResponseEntity<ClienteDTO> buscarCliente(
            @PathVariable String id,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(adminService.buscarCliente(id));
    }
}