package com.ltech.backend.domain.entities;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "lavagem_servicos")
public class LavagemServico {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String nome;

    @Column(length = 1000)
    private String descricao;

    private BigDecimal valor;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TipoCobrancaLavagem tipoCobranca = TipoCobrancaLavagem.VALOR_UNICO;

    @Builder.Default
    private Boolean ativo = true;
}
