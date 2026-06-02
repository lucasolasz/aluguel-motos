package com.ltech.backend.domain.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CobrarDTO(
        @NotBlank @Size(min = 3, max = 4) String cvv) {
}