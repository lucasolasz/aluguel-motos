package com.ltech.backend.domain.entities;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
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
    private String username;
    private String password;
    private boolean enabled;
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
}
