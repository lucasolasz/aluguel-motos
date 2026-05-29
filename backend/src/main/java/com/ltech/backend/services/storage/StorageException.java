package com.ltech.backend.services.storage;

/** Falha de infraestrutura ao acessar o storage (rede, provider, etc). */
public class StorageException extends RuntimeException {

    public StorageException(String message, Throwable cause) {
        super(message, cause);
    }
}
