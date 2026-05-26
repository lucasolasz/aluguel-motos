package com.ltech.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ltech.backend.domain.dtos.CreateLocalDTO;
import com.ltech.backend.domain.dtos.LocalDTO;
import com.ltech.backend.domain.entities.Local;
import com.ltech.backend.domain.repositories.LocalRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class LocalService {

    private final LocalRepository localRepository;

    public List<LocalDTO> listarAtivos() {
        return localRepository.findAllByAtivoTrueOrderByNomeAsc().stream()
                .map(LocalDTO::from)
                .toList();
    }

    public List<LocalDTO> listarTodos() {
        return localRepository.findAll().stream()
                .map(LocalDTO::from)
                .toList();
    }

    public LocalDTO obterPorId(UUID id) {
        return LocalDTO.from(buscar(id));
    }

    public LocalDTO criar(CreateLocalDTO dto) {
        Local local = Local.builder()
                .nome(dto.nome())
                .cep(dto.cep())
                .logradouro(dto.logradouro())
                .numero(dto.numero())
                .complemento(dto.complemento())
                .bairro(dto.bairro())
                .cidade(dto.cidade())
                .estado(dto.estado())
                .ativo(dto.ativo() != null ? dto.ativo() : true)
                .build();
        return LocalDTO.from(localRepository.save(local));
    }

    public LocalDTO atualizar(UUID id, CreateLocalDTO dto) {
        Local local = buscar(id);
        local.setNome(dto.nome());
        local.setCep(dto.cep());
        local.setLogradouro(dto.logradouro());
        local.setNumero(dto.numero());
        local.setComplemento(dto.complemento());
        local.setBairro(dto.bairro());
        local.setCidade(dto.cidade());
        local.setEstado(dto.estado());
        if (dto.ativo() != null) {
            local.setAtivo(dto.ativo());
        }
        return LocalDTO.from(localRepository.save(local));
    }

    public void desativar(UUID id) {
        Local local = buscar(id);
        local.setAtivo(false);
        localRepository.save(local);
    }

    public Local buscar(UUID id) {
        return localRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Local não encontrado"));
    }
}
