package com.ltech.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Data;

@Data
@ConfigurationProperties(prefix = "pagbank")
public class PagBankProperties {

    private String baseUrl = "https://sandbox.api.pagseguro.com";

    private String token;

    private String webhookSecret;

    private boolean enabled = false;
}