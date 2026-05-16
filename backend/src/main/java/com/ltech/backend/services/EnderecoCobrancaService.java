package com.ltech.backend.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ltech.backend.domain.dtos.CreateEnderecoCobrancaDTO;
import com.ltech.backend.domain.dtos.EnderecoCobrancaDTO;
import com.ltech.backend.domain.entities.EnderecoCobranca;
import com.ltech.backend.domain.entities.Usuario;
import com.ltech.backend.domain.repositories.EnderecoCobrancaRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class EnderecoCobrancaService {

    private EnderecoCobrancaRepository enderecoCobrancaRepository;

    public List<EnderecoCobrancaDTO> listarMeusEnderecos(String usuarioId) {
        return enderecoCobrancaRepository.findByUsuarioIdOrderByCreatedAtDesc(usuarioId)
                .stream()
                .map(EnderecoCobrancaDTO::from)
                .toList();
    }

    public EnderecoCobrancaDTO salvarEndereco(CreateEnderecoCobrancaDTO dto, Usuario usuario) {
        EnderecoCobranca endereco = EnderecoCobranca.builder()
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
        return EnderecoCobrancaDTO.from(enderecoCobrancaRepository.save(endereco));
    }
}
