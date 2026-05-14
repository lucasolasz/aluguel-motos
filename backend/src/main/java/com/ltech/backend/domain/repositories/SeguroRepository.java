package com.ltech.backend.domain.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltech.backend.domain.entities.Seguro;

public interface SeguroRepository extends JpaRepository<Seguro, UUID> {

    Optional<Seguro> findBySlug(String slug);
}
