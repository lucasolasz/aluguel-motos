package com.ltech.backend.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ltech.backend.domain.dtos.AcessorioDTO;
import com.ltech.backend.domain.entities.Acessorio;
import com.ltech.backend.services.AcessorioService;

@RestController
@RequestMapping("/api/acessorios")
public class AcessorioController {

    private final AcessorioService acessorioService;

    public AcessorioController(AcessorioService acessorioService) {
        this.acessorioService = acessorioService;
    }

    @GetMapping
    public ResponseEntity<List<AcessorioDTO>> obterTodos() {
        List<AcessorioDTO> acessorios = acessorioService.obterTodos()
                .stream()
                .map(this::toAcessorioDTO)
                .toList();
        return ResponseEntity.ok(acessorios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AcessorioDTO> obterPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(toAcessorioDTO(acessorioService.obterPorId(id)));
    }

    private AcessorioDTO toAcessorioDTO(Acessorio acessorio) {
        return new AcessorioDTO(
                acessorio.getId(),
                acessorio.getNome(),
                acessorio.getDescricao(),
                acessorio.getPrecoPorDia(),
                acessorio.getQuantidadeMaxima()
        );
    }
}
