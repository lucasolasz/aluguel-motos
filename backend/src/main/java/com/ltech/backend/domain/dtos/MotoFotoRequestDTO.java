package com.ltech.backend.domain.dtos;

public record MotoFotoRequestDTO(
    String url,
    Integer ordem,
    Boolean principal
) {
}
