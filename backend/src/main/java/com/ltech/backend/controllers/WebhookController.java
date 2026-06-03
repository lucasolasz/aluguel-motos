package com.ltech.backend.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ltech.backend.services.WebhookService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/webhooks")
@AllArgsConstructor
@Slf4j
public class WebhookController {

    private final WebhookService webhookService;

    @PostMapping("/pagbank")
    public ResponseEntity<Void> receberWebhookPagBank(
            @RequestBody String payload,
            @RequestHeader(value = "x-pagbank-signature", required = false) String signature) {

        log.info("Webhook PagBank recebido: payload length={} signature={}",
                payload != null ? payload.length() : 0,
                signature != null ? "present" : "absent");

        if (!webhookService.validarAssinatura(payload, signature)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        webhookService.processar(payload);
        return ResponseEntity.ok().build();
    }
}
