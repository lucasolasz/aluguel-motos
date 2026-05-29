package com.ltech.backend.services.storage;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.ltech.backend.config.StorageProperties;

/**
 * Valida arquivos de upload segundo as regras de negócio ({@link StorageProperties}):
 * presença, tamanho, extensão e content-type. Independente do provider de storage,
 * podendo ser reaproveitado por qualquer {@link StorageService}.
 */
@Component
public class StorageFileValidator {

    private final StorageProperties props;

    public StorageFileValidator(StorageProperties props) {
        this.props = props;
    }

    /**
     * Resultado da validação: extensão normalizada (minúscula, sem ponto) e
     * content-type efetivo a ser persistido.
     */
    public record ValidatedFile(String extension, String contentType) {}

    /** Valida o arquivo e resolve extensão/content-type. Lança 400/413 se inválido. */
    public ValidatedFile validate(MultipartFile file) {
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

        String declaredType = file.getContentType();
        // Tipos genéricos (ausente/octet-stream) não são confiáveis — alguns navegadores
        // enviam isso para imagens válidas. Aceita e deriva o tipo da extensão (já validada).
        // Só rejeita quando o tipo declarado é concreto E fora da whitelist.
        if (!isGenericType(declaredType)
                && !props.getAllowedContentTypes().contains(declaredType.toLowerCase(Locale.ROOT))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Content-Type não permitido: " + declaredType);
        }

        return new ValidatedFile(extension, resolveContentType(declaredType, extension));
    }

    private boolean isGenericType(String contentType) {
        return !StringUtils.hasText(contentType)
                || "application/octet-stream".equalsIgnoreCase(contentType);
    }

    private String resolveExtension(MultipartFile file) {
        String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
        if (!StringUtils.hasText(ext)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo sem extensão");
        }
        return ext.toLowerCase(Locale.ROOT);
    }

    /** Usa o content-type declarado quando confiável; senão deriva da extensão. */
    private String resolveContentType(String declaredType, String extension) {
        if (!isGenericType(declaredType)) {
            return declaredType;
        }
        return switch (extension) {
            case "png" -> "image/png";
            case "webp" -> "image/webp";
            default -> "image/jpeg";
        };
    }
}
