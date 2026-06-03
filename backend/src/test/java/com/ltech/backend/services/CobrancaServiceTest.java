package com.ltech.backend.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import com.ltech.backend.domain.entities.Cartao;
import com.ltech.backend.domain.entities.Reserva;
import com.ltech.backend.domain.entities.TransacaoPagbank;
import com.ltech.backend.domain.repositories.TransacaoPagbankRepository;
import com.ltech.backend.services.payment.PagBankService;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CobrancaServiceTest {

    @Mock
    private PagBankService pagBankService;

    @Mock
    private CardEncryptionService cardEncryptionService;

    @Mock
    private TransacaoPagbankRepository transacaoPagbankRepository;

    private CobrancaService cobrancaService;

    private Reserva reserva;
    private Cartao cartao;

    @BeforeEach
    void setUp() {
        cobrancaService = new CobrancaService(pagBankService, cardEncryptionService,
                transacaoPagbankRepository);

        cartao = Cartao.builder()
                .id(UUID.randomUUID())
                .nome("EncryptedNome")
                .cpf("EncryptedCpf")
                .tokenPagBank("CARD_abc123")
                .build();

        reserva = Reserva.builder()
                .id(UUID.randomUUID())
                .cartao(cartao)
                .build();

        when(cardEncryptionService.decrypt("EncryptedNome")).thenReturn("João");
        when(cardEncryptionService.decrypt("EncryptedCpf")).thenReturn("84596566089");
    }

    @Test
    void deveCobrarAluguelComSucesso() {
        when(transacaoPagbankRepository.findByIdempotencyKey(anyString()))
                .thenReturn(Optional.empty());
        when(pagBankService.criarCobranca(eq("CARD_abc123"), eq("123"), anyString(),
                anyString(), any(BigDecimal.class), anyString(), anyString(), eq(true), anyString()))
                .thenReturn(new PagBankService.ChargeResult("CHAR_1", "PAID", 170000));
        when(transacaoPagbankRepository.save(any(TransacaoPagbank.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        TransacaoPagbank result = cobrancaService.cobrarAluguel(reserva, 170000, "123");

        assertThat(result.getTipo()).isEqualTo(TransacaoPagbank.Tipo.ALUGUEL);
        assertThat(result.getStatus()).isEqualTo(TransacaoPagbank.Status.PAID);
        assertThat(result.getValorCentavos()).isEqualTo(170000);
        assertThat(result.getChargeIdPagbank()).isEqualTo("CHAR_1");
    }

    @Test
    void deveAutorizarCaucaoComSucesso() {
        when(transacaoPagbankRepository.findByIdempotencyKey(anyString()))
                .thenReturn(Optional.empty());
        when(pagBankService.criarCobranca(eq("CARD_abc123"), eq("123"), anyString(),
                anyString(), any(BigDecimal.class), anyString(), anyString(), eq(false), anyString()))
                .thenReturn(new PagBankService.ChargeResult("CHAR_2", "AUTHORIZED", 50000));
        when(transacaoPagbankRepository.save(any(TransacaoPagbank.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        TransacaoPagbank result = cobrancaService.autorizarCaucao(reserva, 50000, "123");

        assertThat(result.getTipo()).isEqualTo(TransacaoPagbank.Tipo.CAUCAO_PRE_AUTH);
        assertThat(result.getStatus()).isEqualTo(TransacaoPagbank.Status.AUTHORIZED);
        assertThat(result.getValorCentavos()).isEqualTo(50000);
    }

    @Test
    void deveRetornarExistenteQuandoIdempotencyKeyJaExiste() {
        TransacaoPagbank existente = TransacaoPagbank.builder()
                .tipo(TransacaoPagbank.Tipo.ALUGUEL)
                .status(TransacaoPagbank.Status.PAID)
                .valorCentavos(170000)
                .chargeIdPagbank("CHAR_1")
                .idempotencyKey("reserva-" + reserva.getId() + "-aluguel")
                .build();

        when(transacaoPagbankRepository.findByIdempotencyKey(
                "reserva-" + reserva.getId() + "-aluguel"))
                .thenReturn(Optional.of(existente));

        TransacaoPagbank result = cobrancaService.cobrarAluguel(reserva, 170000, "123");

        assertThat(result).isSameAs(existente);
    }

    @Test
    void deveLancarExcecaoQuandoCartaoSemToken() {
        cartao.setTokenPagBank(null);

        assertThrows(IllegalStateException.class, () ->
                cobrancaService.cobrarAluguel(reserva, 170000, "123"));
    }

    @Test
    void deveCapturarCaucaoCapadoNoValorDaPreAuth() {
        TransacaoPagbank preAuth = TransacaoPagbank.builder()
                .reserva(reserva)
                .chargeIdPagbank("CHAR_3")
                .valorCentavos(50000)
                .status(TransacaoPagbank.Status.AUTHORIZED)
                .tipo(TransacaoPagbank.Tipo.CAUCAO_PRE_AUTH)
                .build();

        when(transacaoPagbankRepository.save(any(TransacaoPagbank.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        TransacaoPagbank captura = cobrancaService.capturarCaucao(preAuth, 70000);

        assertThat(captura.getValorCentavos()).isEqualTo(50000);

        ArgumentCaptor<Long> valorCapturado = ArgumentCaptor.forClass(Long.class);
        verify(pagBankService).capturarCobranca(eq("CHAR_3"), valorCapturado.capture(), anyString());
        assertThat(valorCapturado.getValue()).isEqualTo(50000L);
    }
}
