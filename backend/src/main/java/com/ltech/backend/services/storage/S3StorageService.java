package com.ltech.backend.services.storage;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.ltech.backend.config.StorageProperties;
import com.ltech.backend.domain.dtos.UploadResultDTO;
import com.ltech.backend.services.storage.StorageFileValidator.ValidatedFile;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

@Service
@Slf4j
public class S3StorageService implements StorageService {

    private static final String DEFAULT_PREFIX = "outros";

    private final S3Client s3;
    private final S3Presigner presigner;
    private final StorageProperties props;
    private final StorageFileValidator validator;

    public S3StorageService(S3Client s3, S3Presigner presigner, StorageProperties props,
            StorageFileValidator validator) {
        this.s3 = s3;
        this.presigner = presigner;
        this.props = props;
        this.validator = validator;
    }

    @PostConstruct
    void init() {
        if (props.isAutoCreateBucket()) {
            ensureBucketExists();
        }
    }

    @Override
    public UploadResultDTO upload(MultipartFile file, String prefix) {
        ValidatedFile valid = validator.validate(file);
        return store(file, buildDatedKey(prefix, valid.extension()), valid.contentType());
    }

    @Override
    public UploadResultDTO upload(MultipartFile file, UUID motoId) {
        ValidatedFile valid = validator.validate(file);
        return store(file, buildMotoKey(motoId, valid.extension()), valid.contentType());
    }

    @Override
    public UploadResultDTO upload(MultipartFile file, String prefix, UUID parentId) {
        ValidatedFile valid = validator.validate(file);
        return store(file, buildParentKey(prefix, parentId, valid.extension()), valid.contentType());
    }

    @Override
    public void delete(String key) {
        if (!StringUtils.hasText(key)) {
            return;
        }
        try {
            s3.deleteObject(b -> b.bucket(props.getBucket()).key(key));
            log.info("Arquivo removido: key={}", key);
        } catch (SdkException e) {
            log.error("Falha ao remover arquivo '{}' do bucket '{}'", key, props.getBucket(), e);
            throw new StorageException("Falha ao remover arquivo do storage", e);
        }
    }

    @Override
    public String publicUrl(String key) {
        return publicBasePrefix() + key;
    }

    @Override
    public Optional<String> keyFromPublicUrl(String url) {
        if (!StringUtils.hasText(url)) {
            return Optional.empty();
        }
        String prefix = publicBasePrefix();
        return url.startsWith(prefix)
                ? Optional.of(url.substring(prefix.length()))
                : Optional.empty();
    }

    @Override
    public String presignedGetUrl(String key, Duration expiry) {
        GetObjectRequest get = GetObjectRequest.builder()
                .bucket(props.getBucket())
                .key(key)
                .build();
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(expiry)
                .getObjectRequest(get)
                .build();
        return presigner.presignGetObject(presignRequest).url().toString();
    }

    // ─── Transferência ──────────────────────────────────────────────────────────

    /** Persiste o arquivo na chave informada e monta o resultado. Núcleo único de upload. */
    private UploadResultDTO store(MultipartFile file, String key, String contentType) {
        try {
            s3.putObject(
                    PutObjectRequest.builder()
                            .bucket(props.getBucket())
                            .key(key)
                            .contentType(contentType)
                            .build(),
                    RequestBody.fromBytes(file.getBytes()));
        } catch (IOException | SdkException e) {
            log.error("Falha ao enviar arquivo '{}' para o bucket '{}'", key, props.getBucket(), e);
            throw new StorageException("Falha ao enviar arquivo para o storage", e);
        }

        String url = publicUrl(key);
        log.info("Upload concluído: key={} size={}B contentType={}", key, file.getSize(), contentType);
        return new UploadResultDTO(key, url, contentType, file.getSize());
    }

    // ─── Chaves ───────────────────────────────────────────────────────────────

    /** Chave datada e organizada: {@code prefix/yyyy/MM/uuid.ext}. */
    private String buildDatedKey(String prefix, String extension) {
        LocalDate now = LocalDate.now();
        return "%s/%04d/%02d/%s.%s".formatted(
                sanitizePrefix(prefix), now.getYear(), now.getMonthValue(), UUID.randomUUID(), extension);
    }

    /** Chave agrupada por moto: {@code motos/{motoId}/uuid.ext}. */
    private String buildMotoKey(UUID motoId, String extension) {
        return "motos/%s/%s.%s".formatted(motoId, UUID.randomUUID(), extension);
    }

    /** Chave agrupada por reserva: {@code prefix/{parentId}/uuid.ext}. */
    private String buildParentKey(String prefix, UUID parentId, String extension) {
        return "%s/%s/%s.%s".formatted(sanitizePrefix(prefix), parentId, UUID.randomUUID(), extension);
    }

    private String sanitizePrefix(String prefix) {
        return StringUtils.hasText(prefix) ? prefix.replaceAll("^/+|/+$", "") : DEFAULT_PREFIX;
    }

    // ─── URL pública ────────────────────────────────────────────────────────────

    private String publicBasePrefix() {
        String base = StringUtils.hasText(props.getPublicBaseUrl())
                ? props.getPublicBaseUrl()
                : props.getEndpoint() + "/" + props.getBucket();
        return stripTrailingSlash(base) + "/";
    }

    private String stripTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    // ─── Bucket bootstrap ─────────────────────────────────────────────────────────

    private void ensureBucketExists() {
        String bucket = props.getBucket();
        try {
            s3.headBucket(b -> b.bucket(bucket));
            log.info("Bucket '{}' disponível.", bucket);
        } catch (NoSuchBucketException e) {
            createBucket(bucket);
        } catch (S3Exception e) {
            if (e.statusCode() == 404) {
                createBucket(bucket);
            } else {
                log.warn("Não foi possível verificar o bucket '{}' (status {}). Uploads podem falhar.",
                        bucket, e.statusCode(), e);
            }
        } catch (SdkException e) {
            log.warn("Storage indisponível no startup ao verificar o bucket '{}'. Uploads podem falhar.",
                    bucket, e);
        }
    }

    private void createBucket(String bucket) {
        try {
            s3.createBucket(b -> b.bucket(bucket));
            log.info("Bucket '{}' criado.", bucket);
        } catch (SdkException e) {
            log.warn("Falha ao criar o bucket '{}'. Crie-o manualmente no Garage.", bucket, e);
        }
    }
}
