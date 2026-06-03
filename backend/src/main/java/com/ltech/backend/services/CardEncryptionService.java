package com.ltech.backend.services;

import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Service;

import com.ltech.backend.config.EncryptionProperties;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class CardEncryptionService {

    private static final String AES_GCM = "AES/GCM/NoPadding";
    private static final int GCM_IV_BYTES = 12;
    private static final int GCM_TAG_BITS = 128;

    private final byte[] key;
    private final SecureRandom secureRandom;

    public CardEncryptionService(EncryptionProperties props) {
        String keyB64 = props.getKey();
        if (keyB64 == null || keyB64.isBlank()) {
            log.warn("CARD_ENCRYPTION_KEY nao configurada. Dados sensiveis serao armazenados sem criptografia. "
                    + "Gere uma chave: openssl rand -base64 32");
            this.key = null;
            this.secureRandom = null;
            return;
        }
        byte[] decoded = Base64.getDecoder().decode(keyB64);
        if (decoded.length != 32) {
            log.warn("CARD_ENCRYPTION_KEY invalida ({} bytes, esperado 32). "
                    + "Dados sensiveis serao armazenados sem criptografia.", decoded.length);
            this.key = null;
            this.secureRandom = null;
            return;
        }
        this.key = decoded;
        this.secureRandom = new SecureRandom();
    }

    @PostConstruct
    void validate() {
        if (key == null) return;
        String test = "validation-" + System.currentTimeMillis();
        String encrypted = encrypt(test);
        String decrypted = decrypt(encrypted);
        if (!test.equals(decrypted)) {
            throw new IllegalStateException(
                    "CardEncryptionService: encrypt/decrypt round-trip falhou");
        }
    }

    public String encrypt(String plaintext) {
        if (key == null) return plaintext;
        try {
            byte[] iv = new byte[GCM_IV_BYTES];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(AES_GCM);
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"),
                    new GCMParameterSpec(GCM_TAG_BITS, iv));

            byte[] ciphertext = cipher.doFinal(
                    plaintext.getBytes(java.nio.charset.StandardCharsets.UTF_8));

            byte[] combined = new byte[GCM_IV_BYTES + ciphertext.length];
            System.arraycopy(iv, 0, combined, 0, GCM_IV_BYTES);
            System.arraycopy(ciphertext, 0, combined, GCM_IV_BYTES, ciphertext.length);

            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new RuntimeException("Falha ao criptografar dados", e);
        }
    }

    public String decrypt(String encryptedBase64) {
        if (key == null) return encryptedBase64;
        try {
            byte[] combined = Base64.getDecoder().decode(encryptedBase64);

            byte[] iv = new byte[GCM_IV_BYTES];
            byte[] ciphertext = new byte[combined.length - GCM_IV_BYTES];
            System.arraycopy(combined, 0, iv, 0, GCM_IV_BYTES);
            System.arraycopy(combined, GCM_IV_BYTES, ciphertext, 0, ciphertext.length);

            Cipher cipher = Cipher.getInstance(AES_GCM);
            cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key, "AES"),
                    new GCMParameterSpec(GCM_TAG_BITS, iv));

            byte[] plaintext = cipher.doFinal(ciphertext);
            return new String(plaintext, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Falha ao descriptografar dados", e);
        }
    }
}
