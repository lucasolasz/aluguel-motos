package com.ltech.backend.services;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.ltech.backend.domain.dtos.CnhDTO;
import com.ltech.backend.domain.dtos.CreateCnhDTO;
import com.ltech.backend.domain.entities.Cnh;
import com.ltech.backend.domain.entities.Usuario;
import com.ltech.backend.domain.repositories.CnhRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CnhService {

    private CnhRepository cnhRepository;

    public Optional<CnhDTO> buscarMinhaCnh(String usuarioId) {
        return cnhRepository.findByUsuarioId(usuarioId).map(CnhDTO::from);
    }

    public CnhDTO salvarCnh(CreateCnhDTO dto, Usuario usuario) {
        Cnh cnh = cnhRepository.findByUsuarioId(usuario.getId())
                .orElse(Cnh.builder().usuario(usuario).build());

        cnh.setRg(dto.rg());
        cnh.setDataNascimento(dto.dataNascimento());
        cnh.setNumeroRegistro(dto.numeroRegistro());
        cnh.setNumeroCnh(dto.numeroCnh());
        cnh.setDataValidade(dto.dataValidade());
        cnh.setEstado(dto.estado());

        return CnhDTO.from(cnhRepository.save(cnh));
    }
}
