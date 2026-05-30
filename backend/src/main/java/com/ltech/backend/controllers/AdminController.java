package com.ltech.backend.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ltech.backend.domain.dtos.ClienteDTO;
import com.ltech.backend.domain.dtos.ConcluirDevolucaoDTO;
import com.ltech.backend.domain.dtos.CreateLocalDTO;
import com.ltech.backend.domain.dtos.CriarVistoriaDTO;
import com.ltech.backend.domain.dtos.LocalDTO;
import com.ltech.backend.domain.dtos.ReservaAdminDTO;
import com.ltech.backend.domain.dtos.ReservaDetalheDTO;
import com.ltech.backend.domain.dtos.SalvarContratoDTO;
import com.ltech.backend.domain.dtos.UpdateReservaStatusDTO;
import com.ltech.backend.domain.entities.StatusReserva;
import com.ltech.backend.security.UsuarioDetails;
import com.ltech.backend.services.AdminService;
import com.ltech.backend.services.AtendimentoService;
import com.ltech.backend.services.LocalService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@AllArgsConstructor
public class AdminController {

    private AdminService adminService;
    private LocalService localService;
    private AtendimentoService atendimentoService;

    @GetMapping("/reservas")
    public ResponseEntity<List<ReservaAdminDTO>> listarTodasReservas(
            @RequestParam(value = "cpf", required = false) String cpf,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(adminService.listarTodasReservas(cpf));
    }

    @GetMapping("/reservas/{id}")
    public ResponseEntity<ReservaDetalheDTO> buscarReserva(
            @PathVariable String id,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(atendimentoService.buscarDetalhe(id));
    }

    @PatchMapping("/reservas/{id}/status")
    public ResponseEntity<ReservaAdminDTO> atualizarStatusReserva(
            @PathVariable String id,
            @RequestBody UpdateReservaStatusDTO dto,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        StatusReserva novoStatus = StatusReserva.valueOf(dto.status());
        return ResponseEntity.ok(adminService.atualizarStatusReserva(id, novoStatus));
    }

    @PatchMapping("/reservas/{id}/cnh-verificada")
    public ResponseEntity<ReservaDetalheDTO> verificarCnh(
            @PathVariable String id,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        String adminNome = userDetails.getUsuario().getNomeCompleto() != null
                ? userDetails.getUsuario().getNomeCompleto()
                : userDetails.getUsuario().getUsername();
        return ResponseEntity.ok(atendimentoService.marcarCnhVerificada(id, adminNome));
    }

    @PostMapping("/reservas/{id}/cobrar")
    public ResponseEntity<ReservaDetalheDTO> cobrar(
            @PathVariable String id,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(atendimentoService.cobrar(id));
    }

    @PostMapping("/reservas/{id}/vistorias")
    public ResponseEntity<ReservaDetalheDTO> registrarVistoria(
            @PathVariable String id,
            @Valid @RequestBody CriarVistoriaDTO dto,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(atendimentoService.registrarVistoria(id, dto));
    }

    @PostMapping("/reservas/{id}/contrato")
    public ResponseEntity<ReservaDetalheDTO> salvarContrato(
            @PathVariable String id,
            @Valid @RequestBody SalvarContratoDTO dto,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(atendimentoService.salvarContrato(id, dto));
    }

    @PostMapping("/reservas/{id}/concluir-retirada")
    public ResponseEntity<ReservaDetalheDTO> concluirRetirada(
            @PathVariable String id,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(atendimentoService.concluirRetirada(id));
    }

    @PostMapping("/reservas/{id}/concluir-devolucao")
    public ResponseEntity<ReservaDetalheDTO> concluirDevolucao(
            @PathVariable String id,
            @RequestBody(required = false) ConcluirDevolucaoDTO dto,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(atendimentoService.concluirDevolucao(id, dto));
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

    @GetMapping("/locais")
    public ResponseEntity<List<LocalDTO>> listarLocais(
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(localService.listarTodos());
    }

    @PostMapping("/locais")
    public ResponseEntity<LocalDTO> criarLocal(
            @Valid @RequestBody CreateLocalDTO dto,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(localService.criar(dto));
    }

    @PutMapping("/locais/{id}")
    public ResponseEntity<LocalDTO> atualizarLocal(
            @PathVariable UUID id,
            @Valid @RequestBody CreateLocalDTO dto,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(localService.atualizar(id, dto));
    }

    @DeleteMapping("/locais/{id}")
    public ResponseEntity<Void> desativarLocal(
            @PathVariable UUID id,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        localService.desativar(id);
        return ResponseEntity.noContent().build();
    }
}