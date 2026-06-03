package com.ltech.backend.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Base64;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.ltech.backend.config.EncryptionProperties;

class CardEncryptionServiceTest {

    private CardEncryptionService service;

    @BeforeEach
    void setUp() {
        byte[] key = new byte[32];
        for (int i = 0; i < 32; i++) key[i] = (byte) i;
        EncryptionProperties props = new EncryptionProperties();
        props.setKey(Base64.getEncoder().encodeToString(key));
        service = new CardEncryptionService(props);
    }

    @Test
    void deveCriptografarEDescriptografar() {
        String original = "João Silva Gomes";

        String encrypted = service.encrypt(original);
        assertThat(encrypted).isNotBlank().isNotEqualTo(original);

        String decrypted = service.decrypt(encrypted);
        assertThat(decrypted).isEqualTo(original);
    }

    @Test
    void roundtripCpf() {
        String cpf = "84596566089";

        String encrypted = service.encrypt(cpf);
        String decrypted = service.decrypt(encrypted);

        assertThat(decrypted).isEqualTo(cpf);
    }

    @Test
    void valoresDiferentesGeramCiphertextsDiferentes() {
        String a = service.encrypt("João");
        String b = service.encrypt("Maria");

        assertThat(a).isNotEqualTo(b);
    }

    @Test
    void mesmoValorGeraCiphertextsDiferentesPorCausaDoIV() {
        String a = service.encrypt("teste");
        String b = service.encrypt("teste");

        assertThat(a).isNotEqualTo(b);
        assertThat(service.decrypt(a)).isEqualTo("teste");
        assertThat(service.decrypt(b)).isEqualTo("teste");
    }

    @Test
    void passThroughQuandoChaveNaoConfigurada() {
        EncryptionProperties props = new EncryptionProperties();
        props.setKey("");
        CardEncryptionService noopService = new CardEncryptionService(props);

        String result = noopService.encrypt("plain");
        assertThat(result).isEqualTo("plain");
        assertThat(noopService.decrypt("plain")).isEqualTo("plain");
    }
}
