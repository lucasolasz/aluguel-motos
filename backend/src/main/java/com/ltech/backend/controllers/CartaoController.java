package com.ltech.backend.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ltech.backend.domain.dtos.AssociarEnderecoDTO;
import com.ltech.backend.domain.dtos.CartaoDTO;
import com.ltech.backend.domain.dtos.CreateCartaoDTO;
import com.ltech.backend.security.UsuarioDetails;
import com.ltech.backend.services.CartaoService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/cartoes")
@AllArgsConstructor
public class CartaoController {

    private CartaoService cartaoService;

    @GetMapping("/me")
    public ResponseEntity<List<CartaoDTO>> listarMeusCartoes(
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(
                cartaoService.listarMeusCartoes(userDetails.getUsuario().getId()));
    }

    @PostMapping
    public ResponseEntity<CartaoDTO> salvarCartao(
            @RequestBody @Valid CreateCartaoDTO dto,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(
                cartaoService.salvarCartao(dto, userDetails.getUsuario()));
    }

    @PatchMapping("/{id}/endereco")
    public ResponseEntity<CartaoDTO> associarEndereco(
            @PathVariable String id,
            @RequestBody @Valid AssociarEnderecoDTO dto,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(
                cartaoService.associarEndereco(id, dto.enderecoCobrancaId(), userDetails.getUsuario().getId()));
    }
}
