package com.ltech.backend.domain.entities;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.ltech.backend.security.AesEncryptor;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @Column(unique = true)
    private String username;
    private String password;
    private boolean enabled;
    private String nomeCompleto;
    private String telefone;
    @Column(unique = true)
    @Convert(converter = AesEncryptor.class)
    private String cpf;
    @Enumerated(EnumType.STRING)
    private Genero genero;
    private String fotoPerfil;
    @CreatedDate
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "grupo_id")
    private Grupo grupo;

    public Usuario(String username, String password, boolean enabled, Grupo grupo) {
        this.username = username;
        this.password = password;
        this.enabled = enabled;
        this.grupo = grupo;
    }

    public Usuario(String username, String password, boolean enabled, Grupo grupo,
                   String nomeCompleto, String telefone, String cpf) {
        this.username = username;
        this.password = password;
        this.enabled = enabled;
        this.grupo = grupo;
        this.nomeCompleto = nomeCompleto;
        this.telefone = telefone;
        this.cpf = cpf;
    }
}
