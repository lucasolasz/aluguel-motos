package com.ltech.backend.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ltech.backend.domain.dtos.CreateEnderecoCobrancaDTO;
import com.ltech.backend.domain.dtos.EnderecoCobrancaDTO;
import com.ltech.backend.security.UsuarioDetails;
import com.ltech.backend.services.EnderecoCobrancaService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/enderecos-cobranca")
@AllArgsConstructor
public class EnderecoCobrancaController {

    private EnderecoCobrancaService enderecoCobrancaService;

    @GetMapping("/me")
    public ResponseEntity<List<EnderecoCobrancaDTO>> listarMeusEnderecos(
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(
                enderecoCobrancaService.listarMeusEnderecos(userDetails.getUsuario().getId()));
    }

    @PostMapping
    public ResponseEntity<EnderecoCobrancaDTO> salvarEndereco(
            @RequestBody @Valid CreateEnderecoCobrancaDTO dto,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(
                enderecoCobrancaService.salvarEndereco(dto, userDetails.getUsuario()));
    }
}
