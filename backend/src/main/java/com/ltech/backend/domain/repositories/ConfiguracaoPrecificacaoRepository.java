package com.ltech.backend.domain.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltech.backend.domain.entities.ConfiguracaoPrecificacao;

public interface ConfiguracaoPrecificacaoRepository extends JpaRepository<ConfiguracaoPrecificacao, UUID> {
}
