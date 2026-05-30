package com.ltech.backend.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;

import lombok.Data;

/**
 * Configuração do storage S3-compatível (Garage). Prefixo {@code storage.s3}.
 */
@Data
@ConfigurationProperties(prefix = "storage.s3")
public class StorageProperties {

    /** Endpoint S3 do Garage. Ex: https://s3.ltech.app.br */
    private String endpoint;

    /** Região configurada no Garage (ver s3_region no garage.toml). */
    private String region = "us-east-1";

    /** Access key (GK...) gerada no Garage. */
    private String accessKey;

    /** Secret key correspondente à access key. */
    private String secretKey;

    /** Bucket único usado pela aplicação. */
    private String bucket;

    /**
     * Base pública para montar URLs dos objetos. Se vazio, usa
     * {@code endpoint/bucket}. Pode apontar para um CDN na frente do Garage.
     */
    private String publicBaseUrl;

    /** Garage só funciona com path-style (host/bucket/key), não virtual-host. */
    private boolean pathStyleAccess = true;

    /** Cria o bucket no startup caso ele não exista. */
    private boolean autoCreateBucket = true;

    /** Tamanho máximo permitido por arquivo (validação de negócio). */
    private DataSize maxFileSize = DataSize.ofMegabytes(5);

    /** Extensões permitidas (sem ponto, minúsculas). */
    private List<String> allowedExtensions = List.of("jpg", "jpeg", "png", "webp", "pdf");

    /** Content-types permitidos. */
    private List<String> allowedContentTypes = List.of("image/jpeg", "image/png", "image/webp", "application/pdf");

    /** Validade padrão das URLs pré-assinadas, em segundos. */
    private long presignExpirySeconds = 3600;

    /** Número de tentativas extras em caso de falha transitória. */
    private int maxRetries = 3;

    private Timeouts timeouts = new Timeouts();

    private Ssl ssl = new Ssl();

    @Data
    public static class Ssl {
        private boolean trustAll = false;
    }

    @Data
    public static class Timeouts {
        /** Timeout para estabelecer a conexão TCP. */
        private long connectMillis = 5000;
        /** Timeout de leitura/escrita do socket. */
        private long socketMillis = 30000;
        /** Timeout total da chamada à API (inclui retries). */
        private long apiCallMillis = 60000;
    }
}
