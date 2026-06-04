package com.ltech.backend.domain.dtos;

import java.time.LocalDate;

import com.ltech.backend.domain.entities.Genero;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CompleteRegisterRequestDTO(
        @NotBlank @Email String username,
        @NotBlank
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{10,}$",
                message = "Senha não atende aos requisitos de segurança") String password,
        @NotBlank String nomeCompleto,
        @NotBlank String telefone,
        @NotBlank String cpf,
        @NotNull Genero genero,

        @NotNull @Valid CnhData cnh,
        @NotNull @Valid CartaoData cartao,
        @NotNull @Valid EnderecoData endereco) {

    public record CnhData(
            @NotBlank String rg,
            @NotNull LocalDate dataNascimento,
            @NotBlank String numeroRegistro,
            @NotBlank String numeroCnh,
            @NotNull LocalDate dataValidade,
            @NotBlank String estado) {
    }

    public record CartaoData(
            @NotBlank String nome,
            @NotBlank String cpf,
            @NotBlank String numero,
            String validade) {
    }

    public record EnderecoData(
            @NotBlank String cep,
            @NotBlank String logradouro,
            String numero,
            boolean semNumero,
            String complemento,
            @NotBlank String estado,
            @NotBlank String cidade,
            @NotBlank String bairro) {
    }
}
