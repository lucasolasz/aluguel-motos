package com.ltech.backend.domain.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltech.backend.domain.entities.CustomerPagbank;

public interface CustomerPagbankRepository extends JpaRepository<CustomerPagbank, String> {

    Optional<CustomerPagbank> findByUsuarioId(String usuarioId);
}
