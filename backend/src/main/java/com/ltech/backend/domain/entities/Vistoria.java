package com.ltech.backend.domain.entities;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
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
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
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
@EntityListeners(AuditingEntityListener.class)
@Table(name = "vistorias")
public class Vistoria {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "reserva_id", nullable = false)
    @ToString.Exclude
    private Reserva reserva;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoVistoria tipo;

    private Integer kmRegistrado;

    @Enumerated(EnumType.STRING)
    private NivelCombustivel nivelCombustivel;

    @Column(length = 2000)
    private String observacoes;

    @Default
    @OneToMany(mappedBy = "vistoria", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC")
    @ToString.Exclude
    private List<VistoriaFoto> fotos = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;
}
