package com.ltech.backend.services.storage;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDate;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.ltech.backend.config.StorageProperties;
import com.ltech.backend.domain.dtos.UploadResultDTO;

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

    private final S3Client s3;
    private final S3Presigner presigner;
    private final StorageProperties props;

    public S3StorageService(S3Client s3, S3Presigner presigner, StorageProperties props) {
        this.s3 = s3;
        this.presigner = presigner;
        this.props = props;
    }

    @PostConstruct
    void init() {
        if (props.isAutoCreateBucket()) {
            ensureBucketExists();
        }
    }

    @Override
    public UploadResultDTO upload(MultipartFile file, String prefix) {
        validate(file);

        String extension = resolveExtension(file);
        String contentType = resolveContentType(file);
        String key = buildKey(prefix, extension);

        try {
            s3.putObject(
                    PutObjectRequest.builder()
                            .bucket(props.getBucket())
                            .key(key)
                            .contentType(contentType)
                            .contentLength(file.getSize())
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (IOException | SdkException e) {
            log.error("Falha ao enviar arquivo '{}' para o bucket '{}'", key, props.getBucket(), e);
            throw new StorageException("Falha ao enviar arquivo para o storage", e);
        }

        String url = publicUrl(key);
        log.info("Upload concluído: key={} size={}B contentType={}", key, file.getSize(), contentType);
        return new UploadResultDTO(key, url, contentType, file.getSize());
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

    private String publicBasePrefix() {
        String base = StringUtils.hasText(props.getPublicBaseUrl())
                ? props.getPublicBaseUrl()
                : props.getEndpoint() + "/" + props.getBucket();
        return stripTrailingSlash(base) + "/";
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

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo vazio ou ausente");
        }
        if (file.getSize() > props.getMaxFileSize().toBytes()) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,
                    "Arquivo excede o tamanho máximo de " + props.getMaxFileSize().toMegabytes() + "MB");
        }
        String extension = resolveExtension(file);
        if (!props.getAllowedExtensions().contains(extension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Extensão não permitida: " + extension + ". Permitidas: " + props.getAllowedExtensions());
        }
        String contentType = file.getContentType();
        if (contentType != null && !props.getAllowedContentTypes().contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Content-Type não permitido: " + contentType);
        }
    }

    private String resolveExtension(MultipartFile file) {
        String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
        if (!StringUtils.hasText(ext)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo sem extensão");
        }
        return ext.toLowerCase(Locale.ROOT);
    }

    private String resolveContentType(MultipartFile file) {
        String contentType = file.getContentType();
        if (StringUtils.hasText(contentType)) {
            return contentType;
        }
        return switch (resolveExtension(file)) {
            case "png" -> "image/png";
            case "webp" -> "image/webp";
            default -> "image/jpeg";
        };
    }

    /** Chave única e organizada: {@code prefix/yyyy/MM/uuid.ext}. */
    private String buildKey(String prefix, String extension) {
        String cleanPrefix = StringUtils.hasText(prefix)
                ? prefix.replaceAll("^/+|/+$", "")
                : "outros";
        LocalDate now = LocalDate.now();
        return "%s/%04d/%02d/%s.%s".formatted(
                cleanPrefix, now.getYear(), now.getMonthValue(), UUID.randomUUID(), extension);
    }

    private String stripTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

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
