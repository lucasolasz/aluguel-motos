package com.ltech.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ltech.backend.domain.dtos.UpdateUsuarioPerfilDTO;
import com.ltech.backend.domain.dtos.UsuarioPerfilDTO;
import com.ltech.backend.security.UsuarioDetails;
import com.ltech.backend.services.UsuarioService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/usuarios")
@AllArgsConstructor
public class UsuarioController {

    private UsuarioService usuarioService;

    @GetMapping("/me")
    public ResponseEntity<UsuarioPerfilDTO> getMeuPerfil(
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(UsuarioPerfilDTO.from(userDetails.getUsuario()));
    }

    @PutMapping("/me")
    public ResponseEntity<UsuarioPerfilDTO> atualizarMeuPerfil(
            @RequestBody UpdateUsuarioPerfilDTO dto,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        var updated = usuarioService.atualizarPerfil(userDetails.getUsuario().getId(), dto);
        return ResponseEntity.ok(UsuarioPerfilDTO.from(updated));
    }
}
