package com.ltech.backend.services.storage;

import java.time.Duration;
import java.util.Optional;

import org.springframework.web.multipart.MultipartFile;

import com.ltech.backend.domain.dtos.UploadResultDTO;

/**
 * Abstração de storage de arquivos. Desacopla a aplicação do provider concreto
 * (hoje S3/Garage). Trocar de provider = nova implementação desta interface.
 */
public interface StorageService {

    /**
     * Envia um arquivo sob o {@code prefix} informado (ex: "motos") e retorna
     * a chave gerada e a URL pública.
     */
    UploadResultDTO upload(MultipartFile file, String prefix);

    /** Remove o objeto identificado pela chave. Idempotente. */
    void delete(String key);

    /** Monta a URL pública (permanente) de um objeto a partir da chave. */
    String publicUrl(String key);

    /** Gera uma URL GET pré-assinada e temporária (para objetos privados). */
    String presignedGetUrl(String key, Duration expiry);

    /**
     * Extrai a chave de um objeto a partir da sua URL pública. Retorna vazio se
     * a URL não pertence a este storage (ex: caminho relativo, host externo) —
     * garantindo que só objetos nossos sejam candidatos a remoção.
     */
    Optional<String> keyFromPublicUrl(String url);
}
