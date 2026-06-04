package com.ltech.backend.domain.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.ltech.backend.security.AesEncryptor;
import com.ltech.backend.security.CartaoNumeroEncryptor;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
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
@Table(name = "cartoes", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "usuario_id", "fingerprint" })
})
public class Cartao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "endereco_cobranca_id")
    private EnderecoCobranca enderecoCobranca;

    private String nome;
    private String numeroMascarado;
    private String validade;
    @Convert(converter = AesEncryptor.class)
    private String cpf;

    @Column(nullable = false)
    private String fingerprint;

    @Convert(converter = CartaoNumeroEncryptor.class)
    private String numeroEncriptado;

    @CreatedDate
    private LocalDateTime createdAt;
}
