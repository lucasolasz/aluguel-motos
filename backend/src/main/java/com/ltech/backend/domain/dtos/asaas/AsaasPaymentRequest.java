package com.ltech.backend.domain.dtos.asaas;

import java.math.BigDecimal;

public record AsaasPaymentRequest(
        String billingType,
        String customer,
        BigDecimal value,
        String dueDate,
        String description,
        CreditCard creditCard,
        CreditCardHolderInfo creditCardHolderInfo) {

    public record CreditCard(
            String holderName,
            String number,
            String expiryMonth,
            String expiryYear,
            String ccv) {
    }

    public record CreditCardHolderInfo(
            String name,
            String email,
            String cpfCnpj,
            String postalCode,
            String addressNumber,
            String phone,
            String mobilePhone) {
    }
}
