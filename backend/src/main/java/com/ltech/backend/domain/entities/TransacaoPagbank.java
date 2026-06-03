package com.ltech.backend.domain.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Table(name = "transacoes_pagbank", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "charge_id_pagbank" })
}, indexes = {
        @jakarta.persistence.Index(columnList = "reserva_id, tipo")
})
public class TransacaoPagbank {

    public enum Tipo {
        ALUGUEL,
        CAUCAO_PRE_AUTH,
        CAUCAO_CAPTURA,
        CAUCAO_CANCELAMENTO
    }

    public enum Status {
        AUTHORIZED,
        PAID,
        CANCELED,
        DECLINED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "reserva_id", nullable = false)
    private Reserva reserva;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Tipo tipo;

    @Column(name = "charge_id_pagbank", nullable = false)
    private String chargeIdPagbank;

    @Column(name = "valor_centavos", nullable = false)
    private Integer valorCentavos;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "idempotency_key", unique = true)
    private String idempotencyKey;

    @Column(name = "payload_response", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String payloadResponse;

    @CreatedDate
    private LocalDateTime createdAt;
}
