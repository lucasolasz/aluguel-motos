package com.ltech.backend.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ltech.backend.domain.dtos.SeguroDTO;
import com.ltech.backend.domain.entities.Seguro;
import com.ltech.backend.services.SeguroService;

@RestController
@RequestMapping("/api/seguros")
public class SeguroController {

    private final SeguroService seguroService;

    public SeguroController(SeguroService seguroService) {
        this.seguroService = seguroService;
    }

    @GetMapping
    public ResponseEntity<List<SeguroDTO>> obterTodos() {
        List<SeguroDTO> seguros = seguroService.obterTodos()
                .stream()
                .map(this::toSeguroDTO)
                .toList();
        return ResponseEntity.ok(seguros);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SeguroDTO> obterPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(toSeguroDTO(seguroService.obterPorId(id)));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<SeguroDTO> obterPorSlug(@PathVariable String slug) {
        return ResponseEntity.ok(toSeguroDTO(seguroService.obterPorSlug(slug)));
    }

    private SeguroDTO toSeguroDTO(Seguro seguro) {
        return new SeguroDTO(
                seguro.getId(),
                seguro.getNome(),
                seguro.getSlug(),
                seguro.getDescricao(),
                seguro.getPrecoPorDia(),
                seguro.getBasico(),
                seguro.getCoberturas().stream()
                        .map(c -> c.getDescricao())
                        .toList()
        );
    }
}
