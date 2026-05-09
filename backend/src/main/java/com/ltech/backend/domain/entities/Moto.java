package com.ltech.backend.domain.entities;

import java.math.BigDecimal;
import java.util.UUID;

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
@Table(name = "motos")
public class Moto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String nome;

    private String marca;

    private String modelo;

    private Integer ano;

    private String imagemUrl;

    private BigDecimal precoPorDia;

    private BigDecimal caucao;

    // especificações
    private String motor;

    private String potencia;

    private String transmissao;

    private String capacidadeTanque;

    private String alturaAssento;

    private String peso;

    private String itens;

    private Boolean disponivel;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;
}
