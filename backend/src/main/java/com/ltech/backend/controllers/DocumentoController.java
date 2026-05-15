package com.ltech.backend.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ltech.backend.domain.dtos.CreateDocumentoDTO;
import com.ltech.backend.domain.dtos.DocumentoDTO;
import com.ltech.backend.security.UsuarioDetails;
import com.ltech.backend.services.DocumentoService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/documentos")
@AllArgsConstructor
public class DocumentoController {

    private DocumentoService documentoService;

    @GetMapping("/me")
    public ResponseEntity<List<DocumentoDTO>> listarMeusDocumentos(
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(
                documentoService.listarMeusDocumentos(userDetails.getUsuario().getId()));
    }

    @PostMapping
    public ResponseEntity<DocumentoDTO> salvarDocumento(
            @RequestBody @Valid CreateDocumentoDTO dto,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        return ResponseEntity.ok(
                documentoService.salvarDocumento(dto, userDetails.getUsuario()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirDocumento(
            @PathVariable String id,
            @AuthenticationPrincipal UsuarioDetails userDetails) {
        documentoService.excluirDocumento(id, userDetails.getUsuario().getId());
        return ResponseEntity.noContent().build();
    }
}
