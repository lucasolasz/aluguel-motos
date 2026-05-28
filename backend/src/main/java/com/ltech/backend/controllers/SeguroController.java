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

import com.ltech.backend.domain.dtos.SeguroAdminDTO;
import com.ltech.backend.domain.dtos.SeguroDTO;
import com.ltech.backend.domain.dtos.SeguroRequestDTO;
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

    @GetMapping("/admin")
    public ResponseEntity<List<SeguroAdminDTO>> obterTodosAdmin() {
        List<SeguroAdminDTO> seguros = seguroService.obterTodos()
                .stream()
                .map(this::toSeguroAdminDTO)
                .toList();
        return ResponseEntity.ok(seguros);
    }

    @GetMapping("/admin/{id}")
    public ResponseEntity<SeguroAdminDTO> obterAdminPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(toSeguroAdminDTO(seguroService.obterPorId(id)));
    }

    @PostMapping
    public ResponseEntity<SeguroAdminDTO> criar(@RequestBody SeguroRequestDTO dto) {
        Seguro seguro = seguroService.criar(dto);
        return ResponseEntity.ok(toSeguroAdminDTO(seguro));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SeguroAdminDTO> atualizar(@PathVariable UUID id, @RequestBody SeguroRequestDTO dto) {
        Seguro seguro = seguroService.atualizar(id, dto);
        return ResponseEntity.ok(toSeguroAdminDTO(seguro));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        seguroService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    private SeguroDTO toSeguroDTO(Seguro seguro) {
        return new SeguroDTO(
                seguro.getId(),
                seguro.getNome(),
                seguro.getSlug(),
                seguro.getDescricao(),
                seguro.getPrecoPorDia(),
                seguro.getBasico(),
                seguro.getPercentualDesconto(),
                seguro.getCoberturas().stream()
                        .map(c -> new SeguroDTO.CoberturaDTO(
                                c.getNome(),
                                c.getTipo() != null ? c.getTipo().name() : null))
                        .toList()
        );
    }

    private SeguroAdminDTO toSeguroAdminDTO(Seguro seguro) {
        return new SeguroAdminDTO(
                seguro.getId(),
                seguro.getNome(),
                seguro.getSlug(),
                seguro.getDescricao(),
                seguro.getValorOriginal(),
                seguro.getValorComDesconto(),
                seguro.getPercentualDesconto(),
                seguro.getValorTotalPacote(),
                seguro.getMaxParcelasSemJuros(),
                seguro.getRecomendado(),
                seguro.getAtivo(),
                seguro.getCoberturas().stream()
                        .map(c -> new SeguroAdminDTO.CoberturaDTO(
                                c.getId(),
                                c.getNome(),
                                c.getTipo() != null ? c.getTipo().name() : null))
                        .toList()
        );
    }
}
