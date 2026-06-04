package com.ltech.backend.domain.dtos.asaas;

import java.math.BigDecimal;

public record AsaasPaymentResponse(
        String id,
        BigDecimal value,
        BigDecimal netValue,
        String billingType,
        String status,
        String invoiceUrl,
        String transactionReceiptUrl,
        String confirmedDate) {
}
