package com.ltech.backend.controllers;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ltech.backend.domain.dtos.CategoriaDTO;
import com.ltech.backend.domain.dtos.MotoDTO;
import com.ltech.backend.domain.dtos.MotoFotoDTO;
import com.ltech.backend.domain.dtos.MotoRequestDTO;
import com.ltech.backend.domain.entities.Moto;
import com.ltech.backend.services.MotoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/motos")
public class MotoController {

    private final MotoService motoService;

    public MotoController(MotoService motoService) {
        this.motoService = motoService;
    }

    @GetMapping
    public ResponseEntity<List<MotoDTO>> obterTodas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataRetirada,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataDevolucao) {
        List<Moto> motos = (dataRetirada != null && dataDevolucao != null)
                ? motoService.obterDisponiveisPorPeriodo(dataRetirada, dataDevolucao)
                : motoService.obterTodas();
        List<MotoDTO> dtos = motos.stream().map(this::toMotoDTO).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/admin")
    public ResponseEntity<List<MotoDTO>> obterTodasAdmin() {
        List<MotoDTO> dtos = motoService.obterTodas().stream().map(this::toMotoDTO).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/destaque")
    public ResponseEntity<List<MotoDTO>> obterDestaques() {
        List<MotoDTO> dtos = motoService.obterDestaques().stream().map(this::toMotoDTO).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MotoDTO> obterPorId(@PathVariable UUID id) {
        var moto = motoService.obterPorId(id);
        return ResponseEntity.ok(toMotoDTO(moto));
    }

    @PostMapping
    public ResponseEntity<MotoDTO> criar(@Valid @RequestBody MotoRequestDTO dto) {
        Moto moto = motoService.criar(dto);
        return ResponseEntity.ok(toMotoDTO(moto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MotoDTO> atualizar(@PathVariable UUID id, @Valid @RequestBody MotoRequestDTO dto) {
        Moto moto = motoService.atualizar(id, dto);
        return ResponseEntity.ok(toMotoDTO(moto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        motoService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    private MotoDTO toMotoDTO(Moto moto) {
        return new MotoDTO(
            moto.getId(),
            moto.getNome(),
            moto.getSlug(),
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
            moto.getDestaque(),
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
