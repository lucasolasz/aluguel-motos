package com.ltech.backend.domain.dtos;

public record UploadResultDTO(
    String key,
    String url,
    String contentType,
    long size
) {}
