package com.ltech.backend.domain.dtos;

import jakarta.validation.constraints.NotBlank;

public record CartaoValidarDTO(@NotBlank String numero) {
}
