package com.ltech.backend.controllers;

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
    public ResponseEntity<UploadResultDTO> uploadFotoMoto(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(storageService.upload(file, "motos"));
    }

    @DeleteMapping
    public ResponseEntity<Void> remover(@RequestParam("key") String key) {
        storageService.delete(key);
        return ResponseEntity.noContent().build();
    }
}
