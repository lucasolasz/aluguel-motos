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

    @Builder.Default
    private BigDecimal janeiro = BigDecimal.ONE;

    @Builder.Default
    private BigDecimal fevereiro = BigDecimal.ONE;

    @Builder.Default
    private BigDecimal marco = BigDecimal.ONE;

    @Builder.Default
    private BigDecimal abril = BigDecimal.ONE;

    @Builder.Default
    private BigDecimal maio = BigDecimal.ONE;

    @Builder.Default
    private BigDecimal junho = BigDecimal.ONE;

    @Builder.Default
    private BigDecimal julho = new BigDecimal("0.75");

    @Builder.Default
    private BigDecimal agosto = BigDecimal.ONE;

    @Builder.Default
    private BigDecimal setembro = BigDecimal.ONE;

    @Builder.Default
    private BigDecimal outubro = BigDecimal.ONE;

    @Builder.Default
    private BigDecimal novembro = BigDecimal.ONE;

    @Builder.Default
    private BigDecimal dezembro = new BigDecimal("1.25");

    @Builder.Default
    private int carnavalInicioMes = 2;

    @Builder.Default
    private int carnavalInicioDia = 10;

    @Builder.Default
    private int carnavalFimMes = 2;

    @Builder.Default
    private int carnavalFimDia = 17;

    @Builder.Default
    private BigDecimal carnavalFator = new BigDecimal("1.40");

    @Default
    @OneToMany(mappedBy = "configuracao", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC")
    private List<DescontoTier> descontoTiers = new ArrayList<>();
}
