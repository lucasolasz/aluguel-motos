package com.ltech.backend.services.storage;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.LoggerFactory;
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

    /**
     * Envia um arquivo de foto de moto para o path {@code motos/{motoId}/{uuid}.ext}.
     */
    UploadResultDTO upload(MultipartFile file, UUID motoId);

    /**
     * Envia um arquivo para o path {@code prefix/{parentId}/{uuid}.ext}.
     * Usado para vistorias e contratos: prefix = "reservas/{reservaId}/vistorias" ou
     * "reservas/{reservaId}/contratos".
     */
    UploadResultDTO upload(MultipartFile file, String prefix, UUID parentId);

    /** Remove o objeto identificado pela chave. Idempotente. */
    void delete(String key);

    /** Remove por URL pública em best-effort: ignora URL externa/nula e nunca lança. */
    default void deleteByPublicUrl(String url) {
        if (url == null || url.isBlank()) return;
        keyFromPublicUrl(url).ifPresent(key -> {
            try {
                delete(key);
            } catch (RuntimeException e) {
                LoggerFactory.getLogger(StorageService.class)
                        .warn("Falha ao remover arquivo órfão do storage: key={}", key, e);
            }
        });
    }

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
