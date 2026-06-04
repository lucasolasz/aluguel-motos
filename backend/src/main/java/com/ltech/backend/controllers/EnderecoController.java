package com.ltech.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ltech.backend.domain.dtos.CreateEnderecoDTO;
import com.ltech.backend.domain.dtos.EnderecoDTO;
import com.ltech.backend.domain.dtos.UpdateEnderecoDTO;
import com.ltech.backend.security.UsuarioDetails;
import com.ltech.backend.services.EnderecoService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/enderecos")
@AllArgsConstructor
public class EnderecoController {

    private EnderecoService enderecoService;

    @GetMapping("/me")
    public ResponseEntity<EnderecoDTO> buscarMeuEndereco(
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        EnderecoDTO dto = enderecoService.buscarMeuEndereco(userDetails.getUsuario().getId());
        if (dto == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<EnderecoDTO> criarEndereco(
            @RequestBody @Valid CreateEnderecoDTO dto,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(
                enderecoService.criarEndereco(dto, userDetails.getUsuario()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EnderecoDTO> atualizarEndereco(
            @PathVariable java.util.UUID id,
            @RequestBody UpdateEnderecoDTO dto,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(
                enderecoService.atualizarEndereco(id, dto, userDetails.getUsuario().getId()));
    }
}