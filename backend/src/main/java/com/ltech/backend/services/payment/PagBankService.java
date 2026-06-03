package com.ltech.backend.services.payment;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.ltech.backend.config.PagBankProperties;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PagBankService {

    private static final String SANDBOX_PUBLIC_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr+ZqgD892U9/HXsa7XqBZUayPquAfh9xx4iwUbTSUAvTlmiXFQNTp0Bvt/5vK2FhMj39qSv1zi2OuBjvW38q1E374nzx6NNBL5JosV0+SDINTlCG0cmigHuBOyWzYmjgca+mtQu4WczCaApNaSuVqgb8u7Bd9GCOL4YJotvV5+81frlSwQXralhwRzGhj/A57CGPgGKiuPT+AOGmykIGEZsSD9RKkyoKIoc0OS8CPIzdBOtTQCIwrLn2FxI83Clcg55W8gkFSOS6rWNbG5qFZWMll6yl02HtunalHmUlRUL66YeGXdMDC2PuRcmZbGO5a/2tbVppW6mfSWG3NPRpgwIDAQAB";
    private static final Duration PUBLIC_KEY_TTL = Duration.ofDays(30);
    private static final int RETRY_MAX = 3;
    private static final long RETRY_BASE_DELAY_MS = 500;
    private static final int TIMEOUT_SECONDS = 30;

    private final PagBankProperties props;
    private final RestTemplate restTemplate;

    private volatile String cachedPublicKey;
    private volatile Instant publicKeyCachedAt;

    public PagBankService(PagBankProperties props) {
        this.props = props;
        this.restTemplate = new RestTemplateBuilder()
                .connectTimeout(Duration.ofSeconds(TIMEOUT_SECONDS))
                .readTimeout(Duration.ofSeconds(TIMEOUT_SECONDS))
                .build();
    }

    public boolean isEnabled() {
        return props.isEnabled();
    }

    private boolean isSandbox() {
        return props.getBaseUrl().contains("sandbox");
    }

    // ─── Public Key ───────────────────────────────────────────────────────────

    public String getChavePublica() {
        if (isSandbox()) {
            cachedPublicKey = SANDBOX_PUBLIC_KEY;
            publicKeyCachedAt = Instant.now();
            return SANDBOX_PUBLIC_KEY;
        }

        if (cachedPublicKey != null && !cachedPublicKey.isBlank()
                && publicKeyCachedAt != null
                && publicKeyCachedAt.plus(PUBLIC_KEY_TTL).isAfter(Instant.now())) {
            return cachedPublicKey;
        }

        String key = fetchPublicKey();
        cachedPublicKey = key;
        publicKeyCachedAt = Instant.now();
        return key;
    }

    private String fetchPublicKey() {
        try {
            String url = props.getBaseUrl() + "/public-keys/card";
            HttpEntity<Void> request = new HttpEntity<>(authHeaders());
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, request, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && body.get("public_key") != null) {
                String key = (String) body.get("public_key");
                log.info("[PAGBANK] Chave pública obtida (cacheada, {} chars)", key.length());
                return key;
            }
        } catch (Exception e) {
            log.warn("[PAGBANK] GET /public-keys/card falhou, tentando POST: {}", e.getMessage());
        }

        Map<String, Object> postBody = Map.of("type", "card");
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(postBody, authHeaders());
        Map<String, Object> response = restTemplate.postForObject(
                props.getBaseUrl() + "/public-keys", request, Map.class);
        if (response == null) {
            throw new RuntimeException("Resposta vazia do PagBank ao criar chave pública");
        }
        String key = (String) response.get("public_key");
        log.info("[PAGBANK] Chave pública criada via POST (cacheada, {} chars)", key.length());
        return key;
    }

    // ─── Tokenizar Cartão ────────────────────────────────────────────────────

    public TokenizeResult tokenizarCartao(String encrypted) {
        log.info("[PAGBANK] Tokenizando cartão (encrypted length={})",
                encrypted != null ? encrypted.length() : 0);
        return tokenizarCartao(encrypted, null);
    }

    public TokenizeResult tokenizarCartao(String encrypted, String customerIdPagbank) {
        log.info("[PAGBANK] Tokenizando cartão (encrypted length={}, customerId={})",
                encrypted != null ? encrypted.length() : 0,
                customerIdPagbank != null ? maskId(customerIdPagbank) : "null");

        String url;
        if (customerIdPagbank != null && !customerIdPagbank.isBlank()) {
            url = props.getBaseUrl() + "/customers/" + customerIdPagbank + "/cards";
        } else {
            url = props.getBaseUrl() + "/tokens/cards";
        }

        Map<String, Object> body = Map.of("encrypted", encrypted);

        return execWithRetry(() -> {
            Map<String, Object> response = restTemplate.postForObject(url,
                    new HttpEntity<>(body, authHeaders()), Map.class);
            return parseTokenizeResponse(response);
        }, "tokenizarCartao");
    }

    private TokenizeResult parseTokenizeResponse(Map<String, Object> response) {
        if (response == null) {
            throw new RuntimeException("Resposta vazia do PagBank");
        }
        String id = (String) response.get("id");
        String brand = (String) response.get("brand");
        Map<String, Object> holder = cast(response.get("holder"));
        String holderName = holder != null ? (String) holder.get("name") : null;
        String holderTaxId = holder != null ? (String) holder.get("tax_id") : null;
        String lastDigits = (String) response.get("last_digits");
        String firstDigits = (String) response.get("first_digits");
        String expMonth = response.get("exp_month") != null
                ? response.get("exp_month").toString() : null;
        String expYear = response.get("exp_year") != null
                ? response.get("exp_year").toString() : null;

        log.info("[PAGBANK] Cartão tokenizado: id={} brand={} lastDigits={}",
                maskId(id), brand, lastDigits);
        return new TokenizeResult(id, brand, lastDigits, firstDigits,
                expMonth, expYear, holderName, holderTaxId);
    }

    // ─── Customer ─────────────────────────────────────────────────────────────

    public String criarCustomer(String nome, String email, String taxId) {
        log.info("[PAGBANK] Criando customer: email={}", email);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("name", nome);
        body.put("email", email);
        body.put("tax_id", taxId);

        return execWithRetry(() -> {
            Map<String, Object> response = restTemplate.postForObject(
                    props.getBaseUrl() + "/customers",
                    new HttpEntity<>(body, authHeaders()), Map.class);
            if (response == null) {
                throw new RuntimeException("Resposta vazia do PagBank ao criar customer");
            }
            String customerId = (String) response.get("id");
            log.info("[PAGBANK] Customer criado: id={}", maskId(customerId));
            return customerId;
        }, "criarCustomer");
    }

    // ─── Cobrança ─────────────────────────────────────────────────────────────

    public ChargeResult criarCobranca(String tokenPagBank, String cvv, String holderName, String holderTaxId,
            BigDecimal valor, String referenciaId, String descricao, boolean capturar, String idempotencyKey) {

        long centavos = valor.multiply(BigDecimal.valueOf(100)).longValue();
        log.info("[PAGBANK] Criando cobrança: ref={} centavos={} capture={} cvv={}",
                referenciaId, centavos, capturar,
                cvv != null && !cvv.isBlank() ? "***" : "absent");

        Map<String, Object> card = new LinkedHashMap<>();
        card.put("id", tokenPagBank);
        if (cvv != null && !cvv.isBlank()) {
            card.put("security_code", cvv);
        }
        Map<String, Object> cardHolder = new LinkedHashMap<>();
        if (holderName != null) cardHolder.put("name", holderName);
        if (holderTaxId != null) cardHolder.put("tax_id", holderTaxId);
        if (!cardHolder.isEmpty()) card.put("holder", cardHolder);

        Map<String, Object> paymentMethod = new LinkedHashMap<>();
        paymentMethod.put("type", "CREDIT_CARD");
        paymentMethod.put("installments", 1);
        paymentMethod.put("capture", capturar);
        paymentMethod.put("card", card);

        Map<String, Object> amount = Map.of("value", centavos, "currency", "BRL");

        Map<String, Object> postBody = new LinkedHashMap<>();
        postBody.put("reference_id", referenciaId);
        postBody.put("description", descricao);
        postBody.put("amount", amount);
        postBody.put("payment_method", paymentMethod);

        HttpHeaders headers = authHeaders();
        if (idempotencyKey != null) headers.set("x-idempotency-key", idempotencyKey);

        return execWithRetry(() -> {
            Map<String, Object> response = restTemplate.postForObject(
                    props.getBaseUrl() + "/charges",
                    new HttpEntity<>(postBody, headers), Map.class);
            if (response == null) {
                throw new RuntimeException("Resposta vazia do PagBank");
            }
            String chargeId = (String) response.get("id");
            String status = (String) response.get("status");
            log.info("[PAGBANK] Cobrança criada: chargeId={} status={}", maskId(chargeId), status);
            return new ChargeResult(chargeId, status, centavos);
        }, "criarCobranca");
    }

    public void cancelarCobranca(String chargeId, String idempotencyKey) {
        log.info("[PAGBANK] Cancelando cobrança: chargeId={}", maskId(chargeId));

        HttpHeaders headers = authHeaders();
        if (idempotencyKey != null) headers.set("x-idempotency-key", idempotencyKey);

        execWithRetry(() -> {
            restTemplate.postForObject(props.getBaseUrl() + "/charges/" + chargeId + "/cancel",
                    new HttpEntity<>(Map.of(), headers), Map.class);
            return null;
        }, "cancelarCobranca");

        log.info("[PAGBANK] Cobrança cancelada: chargeId={}", maskId(chargeId));
    }

    public void capturarCobranca(String chargeId, long valorCentavos, String idempotencyKey) {
        log.info("[PAGBANK] Capturando cobrança: chargeId={} centavos={}", maskId(chargeId), valorCentavos);

        HttpHeaders headers = authHeaders();
        if (idempotencyKey != null) headers.set("x-idempotency-key", idempotencyKey);

        Map<String, Object> body = Map.of("amount", Map.of("value", valorCentavos));

        execWithRetry(() -> {
            restTemplate.postForObject(props.getBaseUrl() + "/charges/" + chargeId + "/capture",
                    new HttpEntity<>(body, headers), Map.class);
            return null;
        }, "capturarCobranca");

        log.info("[PAGBANK] Cobrança capturada: chargeId={}", maskId(chargeId));
    }

    public void estornarCobranca(String chargeId, long valorCentavos, String idempotencyKey) {
        log.info("[PAGBANK] Estornando cobrança: chargeId={} centavos={}", maskId(chargeId), valorCentavos);

        HttpHeaders headers = authHeaders();
        if (idempotencyKey != null) headers.set("x-idempotency-key", idempotencyKey);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("amount", Map.of("value", valorCentavos));

        execWithRetry(() -> {
            restTemplate.postForObject(props.getBaseUrl() + "/charges/" + chargeId + "/refund",
                    new HttpEntity<>(body, headers), Map.class);
            return null;
        }, "estornarCobranca");

        log.info("[PAGBANK] Cobrança estornada: chargeId={}", maskId(chargeId));
    }

    // ─── Retry Utility ────────────────────────────────────────────────────────

    @FunctionalInterface
    private interface RetryableSupplier<T> {
        T get() throws Exception;
    }

    private <T> T execWithRetry(RetryableSupplier<T> operation, String operationName) {
        Exception lastException = null;
        for (int attempt = 0; attempt < RETRY_MAX; attempt++) {
            try {
                return operation.get();
            } catch (HttpClientErrorException e) {
                if (e.getStatusCode().is4xxClientError()) {
                    String pagBankMsg = extrairMensagemPagBank(e);
                    log.error("[PAGBANK] Erro cliente {} em {}: {}",
                            e.getStatusCode(), operationName, pagBankMsg);
                    throw new RuntimeException(pagBankMsg, e);
                }
                lastException = e;
            } catch (Exception e) {
                lastException = e;
            }

            if (attempt < RETRY_MAX - 1) {
                long delay = RETRY_BASE_DELAY_MS * (1L << attempt);
                log.warn("[PAGBANK] Retry {}/{} para {} em {}ms: {}",
                        attempt + 1, RETRY_MAX, operationName, delay,
                        lastException.getMessage());
                try {
                    Thread.sleep(delay);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Interrompido durante retry", ie);
                }
            }
        }

        log.error("[PAGBANK] Todas as {} tentativas de {} falharam: {}",
                RETRY_MAX, operationName, lastException != null ? lastException.getMessage() : "unknown");
        throw new RuntimeException("Falha ao executar " + operationName + " após " + RETRY_MAX + " tentativas",
                lastException);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private HttpHeaders authHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(props.getToken());
        return headers;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> cast(Object obj) {
        return (Map<String, Object>) obj;
    }

    private String maskId(String id) {
        if (id == null || id.length() <= 8) return "***";
        return id.substring(0, 4) + "***" + id.substring(id.length() - 4);
    }

    @SuppressWarnings("unchecked")
    private String extrairMensagemPagBank(HttpClientErrorException e) {
        try {
            String responseBody = e.getResponseBodyAsString();
            if (responseBody == null || responseBody.isBlank()) {
                return e.getStatusCode() + " " + e.getStatusText();
            }
            com.fasterxml.jackson.databind.ObjectMapper mapper =
                    new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, Object> body = mapper.readValue(responseBody, Map.class);
            Object errorMessages = body.get("error_messages");
            if (errorMessages instanceof java.util.List<?> messages) {
                return messages.stream()
                        .map(msg -> {
                            if (msg instanceof Map<?, ?> m) {
                                String message = m.get("message") != null
                                        ? m.get("message").toString() : "";
                                String description = m.get("description") != null
                                        ? m.get("description").toString() : "";
                                return message + (description.isEmpty() ? "" : ": " + description);
                            }
                            return msg.toString();
                        })
                        .collect(Collectors.joining("; "));
            }
            return responseBody.substring(0, Math.min(responseBody.length(), 300));
        } catch (Exception parseEx) {
            return e.getStatusCode() + " " + e.getStatusText();
        }
    }

    // ─── Records ──────────────────────────────────────────────────────────────

    public record TokenizeResult(
            String id, String brand, String lastDigits, String firstDigits,
            String expMonth, String expYear, String holderName, String holderTaxId) {
    }

    public record ChargeResult(String chargeId, String status, long centavos) {
    }
}
