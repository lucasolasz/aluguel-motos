package com.ltech.backend.domain.dtos.asaas;

import java.util.List;

public record AsaasCustomerListResponse(int totalCount, List<AsaasCustomerResponse> data) {
}
