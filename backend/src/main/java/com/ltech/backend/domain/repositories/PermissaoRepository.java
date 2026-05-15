package com.ltech.backend.domain.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltech.backend.domain.entities.Permissao;

public interface PermissaoRepository extends JpaRepository<Permissao, Long> {

}
