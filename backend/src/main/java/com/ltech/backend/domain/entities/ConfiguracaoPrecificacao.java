package com.ltech.backend.domain.entities;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "configuracao_precificacao")
public class ConfiguracaoPrecificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private BigDecimal janeiro;

    private BigDecimal fevereiro;

    private BigDecimal marco;

    private BigDecimal abril;

    private BigDecimal maio;

    private BigDecimal junho;

    private BigDecimal julho;

    private BigDecimal agosto;

    private BigDecimal setembro;

    private BigDecimal outubro;

    private BigDecimal novembro;

    private BigDecimal dezembro;

    private int carnavalInicioMes;

    private int carnavalInicioDia;

    private int carnavalFimMes;

    private int carnavalFimDia;

    private BigDecimal carnavalFator;

    @Default
    @OneToMany(mappedBy = "configuracao", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC")
    private List<DescontoTier> descontoTiers = new ArrayList<>();
}
