package com.ltech.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Data;

@Data
@ConfigurationProperties(prefix = "card.encryption")
public class EncryptionProperties {

    private String key;
}
