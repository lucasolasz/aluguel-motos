package com.ltech.backend.domain.entities;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "desconto_tiers")
public class DescontoTier {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private int min;

    private int max;

    private int desconto;

    private int ordem;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "configuracao_id")
    private ConfiguracaoPrecificacao configuracao;
}
