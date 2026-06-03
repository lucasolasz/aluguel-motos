package com.ltech.backend.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ltech.backend.config.PagBankProperties;
import com.ltech.backend.domain.dtos.AssociarEnderecoDTO;
import com.ltech.backend.domain.dtos.CartaoDTO;
import com.ltech.backend.domain.dtos.CreateCartaoDTO;
import com.ltech.backend.security.UsuarioDetails;
import com.ltech.backend.services.CartaoService;
import com.ltech.backend.services.payment.PagBankService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/cartoes")
@AllArgsConstructor
public class CartaoController {

    private CartaoService cartaoService;
    private PagBankProperties pagBankProperties;
    private PagBankService pagBankService;

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarCartao(
            @PathVariable String id,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        cartaoService.deletarCartao(id, userDetails.getUsuario().getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/endereco")
    public ResponseEntity<CartaoDTO> associarEndereco(
            @PathVariable String id,
            @RequestBody @Valid AssociarEnderecoDTO dto,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(
                cartaoService.associarEndereco(id, dto.enderecoCobrancaId(), userDetails.getUsuario().getId()));
    }

    @GetMapping("/public-key")
    public ResponseEntity<Map<String, Object>> getPublicKey() {
        Map<String, Object> response = new java.util.LinkedHashMap<>();
        if (pagBankProperties.isEnabled()) {
            try {
                String publicKey = pagBankService.getChavePublica();
                response.put("mode", "pagbank");
                response.put("publicKey", publicKey);
            } catch (Exception e) {
                response.put("mode", "pagbank");
                response.put("publicKey", null);
                response.put("error", "Falha ao buscar chave pública");
            }
        } else {
            response.put("mode", "local");
        }
        return ResponseEntity.ok(response);
    }
}