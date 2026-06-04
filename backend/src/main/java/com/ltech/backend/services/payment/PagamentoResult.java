package com.ltech.backend.services.payment;

import java.math.BigDecimal;

import com.ltech.backend.domain.entities.BillingType;

public record PagamentoResult(
        boolean sucesso,
        String gatewayTransactionId,
        String metodo,
        String mensagem,
        BigDecimal netValue,
        BillingType billingType,
        String invoiceUrl,
        String transactionReceiptUrl) {
}
