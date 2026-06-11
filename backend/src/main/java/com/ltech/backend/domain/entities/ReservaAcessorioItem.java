package com.ltech.backend.domain.entities;

import java.math.BigDecimal;
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
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "reserva_acessorio_items")
public class ReservaAcessorioItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "reserva_id")
    @JsonIgnore
    @ToString.Exclude
    private Reserva reserva;

    @ManyToOne
    @JoinColumn(name = "acessorio_id")
    @ToString.Exclude
    private Acessorio acessorio;

    private int quantidade;

    private BigDecimal precoPorDia;
}
