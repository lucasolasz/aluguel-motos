package com.ltech.backend.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ltech.backend.domain.dtos.LocalDTO;
import com.ltech.backend.services.LocalService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/locais")
@AllArgsConstructor
public class LocalController {

    private final LocalService localService;

    @GetMapping
    public ResponseEntity<List<LocalDTO>> listar() {
        return ResponseEntity.ok(localService.listarAtivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LocalDTO> obterPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(localService.obterPorId(id));
    }
}
