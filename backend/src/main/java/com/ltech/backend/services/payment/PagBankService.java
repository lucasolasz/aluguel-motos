package com.ltech.backend.services.payment;

import java.math.BigDecimal;
import java.util.Map;
import java.util.stream.Collectors;

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

    private final PagBankProperties props;
    private final RestTemplate restTemplate;
    private volatile String cachedPublicKey;

    public PagBankService(PagBankProperties props) {
        this.props = props;
        this.restTemplate = new RestTemplate();
    }

    public boolean isEnabled() {
        return props.isEnabled();
    }

    private HttpHeaders authHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(props.getApiKey());
        return headers;
    }

    @SuppressWarnings("unchecked")
    public String getChavePublica() {
        if (cachedPublicKey != null && !cachedPublicKey.isBlank()) {
            return cachedPublicKey;
        }

        try {
            String url = props.getBaseUrl() + "/public-keys/card";
            HttpEntity<Void> request = new HttpEntity<>(authHeaders());
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, request, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && body.get("public_key") != null) {
                String key = (String) body.get("public_key");
                cachedPublicKey = key;
                log.info("[PAGBANK] Chave pública obtida via GET /public-keys/card (cacheada, {} chars)", key.length());
                return key;
            }
        } catch (Exception e) {
            log.warn("[PAGBANK] GET /public-keys/card falhou, tentando POST para criar: {}", e.getMessage());
        }

        HttpHeaders headers = authHeaders();
        Map<String, Object> postBody = Map.of("type", "card");
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(postBody, headers);

        try {
            Map<String, Object> response = restTemplate.postForObject(
                    props.getBaseUrl() + "/public-keys", request, Map.class);
            if (response == null) {
                throw new RuntimeException("Resposta vazia do PagBank ao criar chave pública");
            }
            String key = (String) response.get("public_key");
            cachedPublicKey = key;
            log.info("[PAGBANK] Chave pública criada via POST (cacheada, {} chars)", key.length());
            return key;
        } catch (Exception e) {
            log.error("Erro ao buscar/criar chave pública do PagBank: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao buscar chave pública: " + extrairMensagem(e));
        }
    }

    @SuppressWarnings("unchecked")
    public TokenizeResult tokenizarCartao(String encrypted) {
        log.info("[PAGBANK] Tokenizando cartão (encrypted length={})", encrypted != null ? encrypted.length() : 0);
        String url = props.getBaseUrl() + "/tokens/cards";
        Map<String, Object> body = Map.of("encrypted", encrypted);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, authHeaders());

        try {
            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);
            if (response == null) {
                throw new RuntimeException("Resposta vazia do PagBank");
            }
            String id = (String) response.get("id");
            String brand = (String) response.get("brand");
            Map<String, Object> holder = (Map<String, Object>) response.get("holder");
            String holderName = holder != null ? (String) holder.get("name") : null;
            String holderTaxId = holder != null ? (String) holder.get("tax_id") : null;

            String lastDigits = (String) response.get("last_digits");
            String firstDigits = (String) response.get("first_digits");
            String expMonth = response.get("exp_month") != null ? response.get("exp_month").toString() : null;
            String expYear = response.get("exp_year") != null ? response.get("exp_year").toString() : null;

            log.info("[PAGBANK] Cartão tokenizado: id={} brand={} lastDigits={}", id, brand, lastDigits);
            return new TokenizeResult(id, brand, lastDigits, firstDigits, expMonth, expYear, holderName, holderTaxId);
        } catch (HttpClientErrorException e) {
            String pagBankMsg = extrairMensagemPagBank(e);
            log.error("[PAGBANK] Erro HTTP {} ao tokenizar cartão: {}", e.getStatusCode(), pagBankMsg);
            throw new RuntimeException("Cartão recusado: " + pagBankMsg);
        } catch (Exception e) {
            if (e instanceof RuntimeException && e.getMessage() != null && e.getMessage().startsWith("Cartão recusado")) {
                throw e;
            }
            log.error("Erro ao tokenizar cartão no PagBank: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao tokenizar cartão: " + extrairMensagem(e));
        }
    }

    @SuppressWarnings("unchecked")
    public ChargeResult criarCobranca(String tokenPagBank, String cvv, String holderName, String holderTaxId,
            BigDecimal valor, String referenciaId, String descricao, boolean capturar) {

        String url = props.getBaseUrl() + "/orders";
        long centavos = valor.multiply(BigDecimal.valueOf(100)).longValue();

        Map<String, Object> card = new java.util.LinkedHashMap<>();
        card.put("id", tokenPagBank);
        card.put("security_code", cvv);
        Map<String, Object> cardHolder = new java.util.LinkedHashMap<>();
        if (holderName != null) cardHolder.put("name", holderName);
        if (holderTaxId != null) cardHolder.put("tax_id", holderTaxId);
        card.put("holder", cardHolder);

        Map<String, Object> paymentMethod = new java.util.LinkedHashMap<>();
        paymentMethod.put("type", "CREDIT_CARD");
        paymentMethod.put("installments", 1);
        paymentMethod.put("capture", capturar);
        paymentMethod.put("card", card);

        Map<String, Object> amount = Map.of("value", centavos, "currency", "BRL");

        Map<String, Object> charge = new java.util.LinkedHashMap<>();
        charge.put("reference_id", referenciaId);
        charge.put("description", descricao);
        charge.put("amount", amount);
        charge.put("payment_method", paymentMethod);

        Map<String, Object> postBody = new java.util.LinkedHashMap<>();
        postBody.put("reference_id", referenciaId);
        postBody.put("charges", java.util.List.of(charge));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(postBody, authHeaders());

        try {
            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);
            if (response == null) {
                throw new RuntimeException("Resposta vazia do PagBank");
            }

            java.util.List<Map<String, Object>> charges = (java.util.List<Map<String, Object>>) response.get("charges");
            if (charges == null || charges.isEmpty()) {
                throw new RuntimeException("Nenhuma cobrança retornada pelo PagBank");
            }

            Map<String, Object> chargeResp = charges.get(0);
            String chargeId = (String) chargeResp.get("id");
            String status = (String) chargeResp.get("status");

            return new ChargeResult(chargeId, status, centavos);
        } catch (Exception e) {
            log.error("Erro ao criar cobrança no PagBank: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao criar cobrança: " + extrairMensagem(e));
        }
    }

    @SuppressWarnings("unchecked")
    public boolean cancelarCobranca(String chargeId) {
        String url = props.getBaseUrl() + "/charges/" + chargeId + "/cancel";
        HttpEntity<Void> request = new HttpEntity<>(authHeaders());

        try {
            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);
            return response != null;
        } catch (Exception e) {
            log.error("Erro ao cancelar cobrança no PagBank: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao cancelar cobrança: " + extrairMensagem(e));
        }
    }

    @SuppressWarnings("unchecked")
    public boolean capturarCobranca(String chargeId, BigDecimal valor) {
        String url = props.getBaseUrl() + "/charges/" + chargeId + "/capture";
        long centavos = valor.multiply(BigDecimal.valueOf(100)).longValue();

        Map<String, Object> body = Map.of("amount", Map.of("value", centavos));
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, authHeaders());

        try {
            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);
            return response != null;
        } catch (Exception e) {
            log.error("Erro ao capturar cobrança no PagBank: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao capturar cobrança: " + extrairMensagem(e));
        }
    }

    private String extrairMensagem(Exception e) {
        if (e.getMessage() != null) {
            return e.getMessage().substring(0, Math.min(e.getMessage().length(), 500));
        }
        return e.getClass().getSimpleName();
    }

    @SuppressWarnings("unchecked")
    private String extrairMensagemPagBank(HttpClientErrorException e) {
        try {
            String responseBody = e.getResponseBodyAsString();
            if (responseBody == null || responseBody.isBlank()) {
                return e.getStatusCode() + " " + e.getStatusText();
            }
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, Object> body = mapper.readValue(responseBody, Map.class);
            Object errorMessages = body.get("error_messages");
            if (errorMessages instanceof java.util.List<?> messages) {
                return messages.stream()
                        .map(msg -> {
                            if (msg instanceof Map<?, ?> m) {
                                String message = m.get("message") != null ? m.get("message").toString() : "";
                                String description = m.get("description") != null ? m.get("description").toString() : "";
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

    public record TokenizeResult(
            String id, String brand, String lastDigits, String firstDigits,
            String expMonth, String expYear, String holderName, String holderTaxId) {
    }

    public record ChargeResult(String chargeId, String status, long centavos) {
    }
}