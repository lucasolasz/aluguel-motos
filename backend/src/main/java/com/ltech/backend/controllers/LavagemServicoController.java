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

import com.ltech.backend.domain.dtos.LavagemServicoDTO;
import com.ltech.backend.domain.dtos.LavagemServicoRequestDTO;
import com.ltech.backend.services.LavagemServicoService;

@RestController
@RequestMapping("/api/lavagens")
public class LavagemServicoController {

    private final LavagemServicoService lavagemServicoService;

    public LavagemServicoController(LavagemServicoService lavagemServicoService) {
        this.lavagemServicoService = lavagemServicoService;
    }

    @GetMapping
    public ResponseEntity<List<LavagemServicoDTO>> obterAtivos() {
        List<LavagemServicoDTO> lavagens = lavagemServicoService.obterAtivos()
                .stream()
                .map(LavagemServicoDTO::from)
                .toList();
        return ResponseEntity.ok(lavagens);
    }

    @GetMapping("/admin")
    public ResponseEntity<List<LavagemServicoDTO>> obterTodos() {
        List<LavagemServicoDTO> lavagens = lavagemServicoService.obterTodos()
                .stream()
                .map(LavagemServicoDTO::from)
                .toList();
        return ResponseEntity.ok(lavagens);
    }

    @GetMapping("/admin/{id}")
    public ResponseEntity<LavagemServicoDTO> obterPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(LavagemServicoDTO.from(lavagemServicoService.obterPorId(id)));
    }

    @PostMapping
    public ResponseEntity<LavagemServicoDTO> criar(@RequestBody LavagemServicoRequestDTO dto) {
        return ResponseEntity.ok(LavagemServicoDTO.from(lavagemServicoService.criar(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LavagemServicoDTO> atualizar(@PathVariable UUID id,
            @RequestBody LavagemServicoRequestDTO dto) {
        return ResponseEntity.ok(LavagemServicoDTO.from(lavagemServicoService.atualizar(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        lavagemServicoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
