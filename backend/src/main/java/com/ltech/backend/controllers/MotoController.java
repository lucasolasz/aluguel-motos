package com.ltech.backend.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ltech.backend.domain.dtos.CategoriaDTO;
import com.ltech.backend.domain.dtos.MotoDTO;
import com.ltech.backend.domain.dtos.MotoFotoDTO;
import com.ltech.backend.domain.entities.Moto;
import com.ltech.backend.services.MotoService;

@RestController
@RequestMapping("/api/motos")
public class MotoController {

    private final MotoService motoService;

    public MotoController(MotoService motoService) {
        this.motoService = motoService;
    }

    @GetMapping
    public ResponseEntity<List<MotoDTO>> obterTodas() {
        List<MotoDTO> motos = motoService.obterTodas()
            .stream()
            .map(this::toMotoDTO)
            .toList();
        return ResponseEntity.ok(motos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MotoDTO> obterPorId(@PathVariable UUID id) {
        var moto = motoService.obterPorId(id);
        return ResponseEntity.ok(toMotoDTO(moto));
    }

    private MotoDTO toMotoDTO(Moto moto) {
        return new MotoDTO(
            moto.getId(),
            moto.getNome(),
            moto.getMarca(),
            moto.getModelo(),
            moto.getAno(),
            moto.getPrecoPorDia(),
            moto.getCaucao(),
            moto.getMotor(),
            moto.getPotencia(),
            moto.getTransmissao(),
            moto.getCapacidadeTanque(),
            moto.getAlturaAssento(),
            moto.getPeso(),
            moto.getItens(),
            moto.getDisponivel(),
            moto.getFotos().stream()
                .map(foto -> new MotoFotoDTO(
                    foto.getId(),
                    foto.getUrl(),
                    foto.getOrdem(),
                    foto.getPrincipal()
                ))
                .toList(),
            moto.getCategoria() != null ? new CategoriaDTO(
                moto.getCategoria().getId(),
                moto.getCategoria().getNome(),
                moto.getCategoria().getDescricao(),
                moto.getCategoria().getSlug(),
                moto.getCategoria().getImageUrl()
            ) : null
        );
    }
}
