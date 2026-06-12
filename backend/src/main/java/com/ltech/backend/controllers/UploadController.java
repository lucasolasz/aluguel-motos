package com.ltech.backend.controllers;

import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ltech.backend.domain.dtos.UploadResultDTO;
import com.ltech.backend.services.storage.StorageService;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private final StorageService storageService;

    public UploadController(StorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping(value = "/motos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResultDTO> uploadFotoMoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam("motoId") UUID motoId) {
        return ResponseEntity.ok(storageService.upload(file, motoId));
    }

    @PostMapping(value = "/vistorias", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResultDTO> uploadVistoria(
            @RequestParam("file") MultipartFile file,
            @RequestParam("reservaId") UUID reservaId,
            @RequestParam(value = "timestamp", required = false) String timestamp) {
        return ResponseEntity.ok(storageService.uploadReservaArquivo(file, reservaId, "vistoria", timestamp));
    }

    @PostMapping(value = "/contratos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResultDTO> uploadContrato(
            @RequestParam("file") MultipartFile file,
            @RequestParam("reservaId") UUID reservaId,
            @RequestParam(value = "timestamp", required = false) String timestamp) {
        return ResponseEntity.ok(storageService.uploadReservaArquivo(file, reservaId, "contrato", timestamp));
    }

    @DeleteMapping
    public ResponseEntity<Void> remover(@RequestParam("key") String key) {
        storageService.delete(key);
        return ResponseEntity.noContent().build();
    }
}
