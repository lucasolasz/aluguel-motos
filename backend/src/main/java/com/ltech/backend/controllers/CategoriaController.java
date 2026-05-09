package com.ltech.backend.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ltech.backend.domain.dtos.CategoriaDTO;
import com.ltech.backend.services.CategoriaService;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public ResponseEntity<List<CategoriaDTO>> obterTodas() {
        List<CategoriaDTO> categorias = categoriaService.obterTodas()
            .stream()
            .map(categoria -> new CategoriaDTO(
                categoria.getId(),
                categoria.getNome(),
                categoria.getDescricao(),
                categoria.getSlug(),
                categoria.getImageUrl()
            ))
            .toList();
        return ResponseEntity.ok(categorias);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaDTO> obterPorId(@PathVariable UUID id) {
        var categoria = categoriaService.obterPorId(id);
        var dto = new CategoriaDTO(
            categoria.getId(),
            categoria.getNome(),
            categoria.getDescricao(),
            categoria.getSlug(),
            categoria.getImageUrl()
        );
        return ResponseEntity.ok(dto);
    }
}
