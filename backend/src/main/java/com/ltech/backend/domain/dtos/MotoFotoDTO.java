package com.ltech.backend.domain.dtos;

import java.util.UUID;

public record MotoFotoDTO(
    UUID id,
    String url,
    Integer ordem,
    Boolean principal
) {}
