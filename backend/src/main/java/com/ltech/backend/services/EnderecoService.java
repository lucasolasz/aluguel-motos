package com.ltech.backend.services;

import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ltech.backend.domain.dtos.CreateEnderecoDTO;
import com.ltech.backend.domain.dtos.EnderecoDTO;
import com.ltech.backend.domain.dtos.UpdateEnderecoDTO;
import com.ltech.backend.domain.entities.Endereco;
import com.ltech.backend.domain.entities.Usuario;
import com.ltech.backend.domain.repositories.EnderecoRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class EnderecoService {

    private EnderecoRepository enderecoRepository;

    public EnderecoDTO buscarMeuEndereco(String usuarioId) {
        return enderecoRepository.findByUsuarioId(usuarioId)
                .map(EnderecoDTO::from)
                .orElse(null);
    }

    public EnderecoDTO criarEndereco(CreateEnderecoDTO dto, Usuario usuario) {
        enderecoRepository.findByUsuarioId(usuario.getId()).ifPresent(e -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Usuário já possui endereço cadastrado");
        });
        try {
            Endereco endereco = Endereco.builder()
                    .usuario(usuario)
                    .cep(dto.cep())
                    .logradouro(dto.logradouro())
                    .numero(dto.semNumero() ? null : dto.numero())
                    .semNumero(dto.semNumero())
                    .complemento(dto.complemento())
                    .estado(dto.estado())
                    .cidade(dto.cidade())
                    .bairro(dto.bairro())
                    .build();
            return EnderecoDTO.from(enderecoRepository.save(endereco));
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Usuário já possui endereço cadastrado");
        }
    }

    public EnderecoDTO atualizarEndereco(UUID enderecoId, UpdateEnderecoDTO dto, String usuarioId) {
        Endereco endereco = enderecoRepository.findById(enderecoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Endereço não encontrado"));
        if (!endereco.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Endereço não pertence ao usuário");
        }
        if (dto.cep() != null) endereco.setCep(dto.cep());
        if (dto.logradouro() != null) endereco.setLogradouro(dto.logradouro());
        if (dto.numero() != null) endereco.setNumero(dto.numero());
        if (dto.semNumero() != null) {
            endereco.setSemNumero(dto.semNumero());
            if (dto.semNumero()) endereco.setNumero(null);
        }
        if (dto.complemento() != null) endereco.setComplemento(dto.complemento());
        if (dto.estado() != null) endereco.setEstado(dto.estado());
        if (dto.cidade() != null) endereco.setCidade(dto.cidade());
        if (dto.bairro() != null) endereco.setBairro(dto.bairro());
        return EnderecoDTO.from(enderecoRepository.save(endereco));
    }
}