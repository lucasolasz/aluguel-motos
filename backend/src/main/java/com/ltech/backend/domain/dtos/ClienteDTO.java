package com.ltech.backend.domain.dtos;

import java.time.LocalDateTime;
import java.util.List;

import com.ltech.backend.domain.entities.Usuario;

public record ClienteDTO(
        String id,
        String username,
        String nomeCompleto,
        String telefone,
        String cpf,
        String numeroCnh,
        String fotoPerfil,
        LocalDateTime createdAt,
        int totalReservas,
        List<String> grupos) {

    /** Versão completa — uso restrito (detalhe do cliente p/ atendimento). */
    public static ClienteDTO from(Usuario usuario, int totalReservas) {
        return build(usuario, totalReservas, usuario.getCpf(), usuario.getNumeroCnh());
    }

    /** Versão mascarada — listagem ampla (LGPD: minimização da exposição de CPF/CNH). */
    public static ClienteDTO fromMasked(Usuario usuario, int totalReservas) {
        return build(usuario, totalReservas, maskCpf(usuario.getCpf()), maskTail(usuario.getNumeroCnh()));
    }

    private static ClienteDTO build(Usuario usuario, int totalReservas, String cpf, String numeroCnh) {
        List<String> grupos = usuario.getGrupo() != null
                ? List.of(usuario.getGrupo().getNome())
                : List.of();

        return new ClienteDTO(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getNomeCompleto(),
                usuario.getTelefone(),
                cpf,
                numeroCnh,
                usuario.getFotoPerfil(),
                usuario.getCreatedAt(),
                totalReservas,
                grupos);
    }

    /** Mascara o CPF revelando só os 2 últimos dígitos: {@code ***.***.***-NN}. */
    private static String maskCpf(String cpf) {
        if (cpf == null) return null;
        String digits = cpf.replaceAll("\\D", "");
        if (digits.length() < 2) return "***.***.***-**";
        return "***.***.***-" + digits.substring(digits.length() - 2);
    }

    /** Mascara um identificador revelando só os 2 últimos dígitos. */
    private static String maskTail(String value) {
        if (value == null) return null;
        String digits = value.replaceAll("\\D", "");
        if (digits.length() < 2) return "****";
        return "*".repeat(digits.length() - 2) + digits.substring(digits.length() - 2);
    }
}