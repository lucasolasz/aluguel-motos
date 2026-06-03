package com.ltech.backend.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ltech.backend.config.PagBankProperties;
import com.ltech.backend.domain.entities.TransacaoPagbank;
import com.ltech.backend.domain.repositories.TransacaoPagbankRepository;

@ExtendWith(MockitoExtension.class)
class WebhookServiceTest {

    @Mock
    private PagBankProperties pagBankProperties;

    @Mock
    private TransacaoPagbankRepository transacaoPagbankRepository;

    private WebhookService webhookService;

    @BeforeEach
    void setUp() {
        webhookService = new WebhookService(pagBankProperties, transacaoPagbankRepository);
    }

    @Test
    void devePermitirQuandoSecretNaoConfigurada() {
        when(pagBankProperties.getWebhookSecret()).thenReturn(null);

        boolean valid = webhookService.validarAssinatura("body", "any-signature");
        assertThat(valid).isTrue();
    }

    @Test
    void deveAtualizarStatusDaTransacao() {
        TransacaoPagbank transacao = TransacaoPagbank.builder()
                .id(UUID.randomUUID())
                .chargeIdPagbank("CHAR_123")
                .status(TransacaoPagbank.Status.AUTHORIZED)
                .build();

        when(transacaoPagbankRepository.findByChargeIdPagbank("CHAR_123"))
                .thenReturn(Optional.of(transacao));

        String payload = """
                {
                    "id": "NOTI_abc",
                    "type": "CHARGE",
                    "charge": {
                        "id": "CHAR_123",
                        "status": "PAID"
                    }
                }
                """;

        webhookService.processar(payload);

        assertThat(transacao.getStatus()).isEqualTo(TransacaoPagbank.Status.PAID);
        verify(transacaoPagbankRepository).save(transacao);
    }

    @Test
    void deveIgnorarQuandoChargeDesconhecida() {
        when(transacaoPagbankRepository.findByChargeIdPagbank("CHAR_999"))
                .thenReturn(Optional.empty());

        String payload = """
                {
                    "charge": {
                        "id": "CHAR_999",
                        "status": "PAID"
                    }
                }
                """;

        webhookService.processar(payload);
        verify(transacaoPagbankRepository, never()).save(any());
    }

    @Test
    void deveIgnorarQuandoStatusJaEhOMesmo() {
        TransacaoPagbank transacao = TransacaoPagbank.builder()
                .id(UUID.randomUUID())
                .chargeIdPagbank("CHAR_123")
                .status(TransacaoPagbank.Status.PAID)
                .build();

        when(transacaoPagbankRepository.findByChargeIdPagbank("CHAR_123"))
                .thenReturn(Optional.of(transacao));

        String payload = """
                {
                    "charge": {
                        "id": "CHAR_123",
                        "status": "PAID"
                    }
                }
                """;

        webhookService.processar(payload);
        verify(transacaoPagbankRepository, never()).save(any());
    }

    @Test
    void deveMapearStatusCANCELED() {
        TransacaoPagbank transacao = TransacaoPagbank.builder()
                .id(UUID.randomUUID())
                .chargeIdPagbank("CHAR_456")
                .status(TransacaoPagbank.Status.AUTHORIZED)
                .build();

        when(transacaoPagbankRepository.findByChargeIdPagbank("CHAR_456"))
                .thenReturn(Optional.of(transacao));

        String payload = """
                {
                    "charge": {
                        "id": "CHAR_456",
                        "status": "CANCELED"
                    }
                }
                """;

        webhookService.processar(payload);

        assertThat(transacao.getStatus()).isEqualTo(TransacaoPagbank.Status.CANCELED);
    }
}
