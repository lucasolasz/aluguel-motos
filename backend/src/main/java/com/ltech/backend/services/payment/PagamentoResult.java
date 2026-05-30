package com.ltech.backend.services.payment;

/**
 * Resultado de uma operação no gateway de pagamento. Desacopla o domínio do
 * provider concreto (hoje simulado; futuro PagBank).
 */
public record PagamentoResult(
        boolean sucesso,
        String gatewayTransactionId,
        String metodo,
        String mensagem) {
}
