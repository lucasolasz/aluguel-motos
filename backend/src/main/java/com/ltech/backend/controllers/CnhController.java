package com.ltech.backend.controllers;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ltech.backend.domain.dtos.CnhDTO;
import com.ltech.backend.domain.dtos.CreateCnhDTO;
import com.ltech.backend.security.UsuarioDetails;
import com.ltech.backend.services.CnhService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/cnh")
@AllArgsConstructor
public class CnhController {

    private CnhService cnhService;

    @GetMapping("/me")
    public ResponseEntity<CnhDTO> buscarMinhaCnh(
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        Optional<CnhDTO> cnh = cnhService.buscarMinhaCnh(userDetails.getUsuario().getId());
        return cnh.map(ResponseEntity::ok).orElse(ResponseEntity.noContent().build());
    }

    @PostMapping
    public ResponseEntity<CnhDTO> salvarCnh(
            @RequestBody @Valid CreateCnhDTO dto,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(cnhService.salvarCnh(dto, userDetails.getUsuario()));
    }
}
