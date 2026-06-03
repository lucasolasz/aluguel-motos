package com.ltech.backend.services.payment;

public record PagamentoResult(
        boolean sucesso,
        String gatewayTransactionId,
        String metodo,
        String mensagem) {
}
