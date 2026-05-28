package com.ltech.backend.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ltech.backend.domain.dtos.AcessorioDTO;
import com.ltech.backend.domain.dtos.AcessorioRequestDTO;
import com.ltech.backend.services.AcessorioService;

@RestController
@RequestMapping("/api/acessorios")
public class AcessorioController {

    private final AcessorioService acessorioService;

    public AcessorioController(AcessorioService acessorioService) {
        this.acessorioService = acessorioService;
    }

    @GetMapping
    public ResponseEntity<List<AcessorioDTO>> obterAtivos() {
        List<AcessorioDTO> acessorios = acessorioService.obterAtivos()
                .stream()
                .map(AcessorioDTO::from)
                .toList();
        return ResponseEntity.ok(acessorios);
    }

    @GetMapping("/admin")
    public ResponseEntity<List<AcessorioDTO>> obterTodos() {
        List<AcessorioDTO> acessorios = acessorioService.obterTodos()
                .stream()
                .map(AcessorioDTO::from)
                .toList();
        return ResponseEntity.ok(acessorios);
    }

    @GetMapping("/admin/{id}")
    public ResponseEntity<AcessorioDTO> obterPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(AcessorioDTO.from(acessorioService.obterPorId(id)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AcessorioDTO> obterPorIdPublico(@PathVariable UUID id) {
        return ResponseEntity.ok(AcessorioDTO.from(acessorioService.obterPorId(id)));
    }

    @PostMapping
    public ResponseEntity<AcessorioDTO> criar(@RequestBody AcessorioRequestDTO dto) {
        return ResponseEntity.ok(AcessorioDTO.from(acessorioService.criar(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AcessorioDTO> atualizar(@PathVariable UUID id,
            @RequestBody AcessorioRequestDTO dto) {
        return ResponseEntity.ok(AcessorioDTO.from(acessorioService.atualizar(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        acessorioService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
