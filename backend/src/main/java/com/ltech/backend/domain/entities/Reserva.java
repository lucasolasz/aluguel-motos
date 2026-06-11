package com.ltech.backend.domain.entities;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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
@EntityListeners(AuditingEntityListener.class)
@Table(name = "reservas")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "moto_id")
    private Moto moto;

    @ManyToOne
    @JoinColumn(name = "seguro_id")
    private Seguro seguro;

    @ManyToOne
    @JoinColumn(name = "cartao_id", nullable = true)
    private Cartao cartao;

    @ManyToOne
    @JoinColumn(name = "lavagem_servico_id", nullable = true)
    private LavagemServico lavagemServico;

    private LocalDate dataRetirada;

    private LocalDate dataDevolucao;

    private LocalTime horaRetirada;

    private LocalTime horaDevolucao;

    @ManyToOne
    @JoinColumn(name = "local_retirada_id")
    private Local localRetirada;

    @ManyToOne
    @JoinColumn(name = "local_devolucao_id")
    private Local localDevolucao;

    private int totalDias;

    @Enumerated(EnumType.STRING)
    @Default
    private StatusReserva status = StatusReserva.PENDENTE;

    private BigDecimal precoPorDia;

    private BigDecimal caucao;

    private BigDecimal totalAluguel;

    private BigDecimal totalSeguro;

    private BigDecimal totalAcessorios;

    private BigDecimal totalLavagem;

    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    private TipoQuilometragem tipoQuilometragem;

    private BigDecimal fatorDesconto;

    private BigDecimal fatorSazonal;

    @Default
    @OneToMany(mappedBy = "reserva", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReservaAcessorioItem> acessorios = new ArrayList<>();

    // ─── Atendimento presencial (retirada / devolução) ───────────────────────────

    @Default
    private Boolean cnhVerificada = false;

    private String cnhVerificadaPor;

    private LocalDateTime cnhVerificadaEm;

    private LocalDateTime retiradaConcluidaEm;

    private LocalDateTime devolucaoConcluidaEm;

    @CreatedDate
    private LocalDateTime createdAt;
}
