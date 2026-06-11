package com.ltech.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ltech.backend.domain.dtos.ConfiguracaoPrecificacaoDTO;
import com.ltech.backend.domain.dtos.ConfiguracaoPrecificacaoRequestDTO;
import com.ltech.backend.services.ConfiguracaoPrecificacaoService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/precificacao")
@AllArgsConstructor
public class ConfiguracaoPrecificacaoController {

    private final ConfiguracaoPrecificacaoService service;

    @GetMapping
    public ConfiguracaoPrecificacaoDTO obter() {
        return service.obter();
    }

    @GetMapping("/admin")
    public ConfiguracaoPrecificacaoDTO obterAdmin() {
        return service.obter();
    }

    @PutMapping
    public ResponseEntity<ConfiguracaoPrecificacaoDTO> salvar(@Valid @RequestBody ConfiguracaoPrecificacaoRequestDTO dto) {
        return ResponseEntity.ok(service.salvar(dto));
    }
}
