package com.ltech.backend.domain.dtos.asaas;

public record AsaasCustomerRequest(
        String name,
        String cpfCnpj,
        String email,
        String mobilePhone,
        String address,
        String addressNumber,
        String complement,
        String province,
        String postalCode,
        String externalReference,
        boolean notificationDisabled,
        boolean foreignCustomer) {
}
