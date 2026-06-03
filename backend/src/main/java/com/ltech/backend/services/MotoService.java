package com.ltech.backend.services;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ltech.backend.domain.dtos.MotoFotoRequestDTO;
import com.ltech.backend.domain.dtos.MotoRequestDTO;
import com.ltech.backend.domain.entities.Categoria;
import com.ltech.backend.domain.entities.Moto;
import com.ltech.backend.domain.entities.MotoFoto;
import com.ltech.backend.domain.repositories.CategoriaRepository;
import com.ltech.backend.domain.repositories.MotoRepository;
import com.ltech.backend.domain.repositories.ReservaRepository;
import com.ltech.backend.services.storage.StorageService;

@Service
public class MotoService {

    private final MotoRepository motoRepository;
    private final ReservaRepository reservaRepository;
    private final CategoriaRepository categoriaRepository;
    private final StorageService storageService;

    public MotoService(MotoRepository motoRepository, ReservaRepository reservaRepository,
            CategoriaRepository categoriaRepository, StorageService storageService) {
        this.motoRepository = motoRepository;
        this.reservaRepository = reservaRepository;
        this.categoriaRepository = categoriaRepository;
        this.storageService = storageService;
    }

    public List<Moto> obterTodas() {
        return motoRepository.findAll();
    }

    public List<Moto> obterDestaques() {
        return motoRepository.findByDestaqueTrue();
    }

    public Moto obterPorId(UUID id) {
        return motoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Moto não encontrada: " + id));
    }

    public List<Moto> obterDisponiveisPorPeriodo(LocalDate inicio, LocalDate fim) {
        Set<UUID> ocupados = reservaRepository.findMotoIdsOcupados(inicio, fim)
                .stream()
                .collect(Collectors.toSet());
        return motoRepository.findAll().stream()
                .filter(m -> Boolean.TRUE.equals(m.getDisponivel()))
                .filter(m -> !ocupados.contains(m.getId()))
                .toList();
    }

    public Moto criar(MotoRequestDTO dto) {
        Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada: " + dto.categoriaId()));

        List<MotoFoto> fotos = (dto.fotos() != null ? dto.fotos() : List.<MotoFotoRequestDTO>of())
                .stream()
                .map(f -> MotoFoto.builder()
                        .url(f.url())
                        .ordem(f.ordem() != null ? f.ordem() : 0)
                        .principal(f.principal() != null ? f.principal() : false)
                        .build())
                .toList();

        Moto moto = Moto.builder()
                .nome(dto.nome())
                .slug(dto.slug())
                .marca(dto.marca())
                .modelo(dto.modelo())
                .ano(dto.ano())
                .precoPorDia(dto.precoPorDia())
                .caucao(dto.caucao())
                .motor(dto.motor())
                .potencia(dto.potencia())
                .transmissao(dto.transmissao())
                .capacidadeTanque(dto.capacidadeTanque())
                .alturaAssento(dto.alturaAssento())
                .peso(dto.peso())
                .itens(dto.itens())
                .disponivel(dto.disponivel() != null ? dto.disponivel() : true)
                .destaque(dto.destaque() != null ? dto.destaque() : false)
                .categoria(categoria)
                .fotos(fotos)
                .build();

        // Associa o moto em cada foto para a relação bidirecional
        for (MotoFoto foto : fotos) {
            foto.setMoto(moto);
        }

        return motoRepository.save(moto);
    }

    public Moto atualizar(UUID id, MotoRequestDTO dto) {
        Moto moto = obterPorId(id);

        Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada: " + dto.categoriaId()));

        moto.setNome(dto.nome());
        moto.setSlug(dto.slug());
        moto.setMarca(dto.marca());
        moto.setModelo(dto.modelo());
        moto.setAno(dto.ano());
        moto.setPrecoPorDia(dto.precoPorDia());
        moto.setCaucao(dto.caucao());
        moto.setMotor(dto.motor());
        moto.setPotencia(dto.potencia());
        moto.setTransmissao(dto.transmissao());
        moto.setCapacidadeTanque(dto.capacidadeTanque());
        moto.setAlturaAssento(dto.alturaAssento());
        moto.setPeso(dto.peso());
        moto.setItens(dto.itens());
        moto.setDisponivel(dto.disponivel() != null ? dto.disponivel() : moto.getDisponivel());
        moto.setDestaque(dto.destaque() != null ? dto.destaque() : moto.getDestaque());
        moto.setCategoria(categoria);

        Set<String> urlsAntigas = moto.getFotos().stream()
                .map(MotoFoto::getUrl)
                .collect(Collectors.toSet());

        // Atualiza fotos: limpa e recria
        moto.getFotos().clear();
        Set<String> urlsNovas = new java.util.HashSet<>();
        if (dto.fotos() != null) {
            for (var f : dto.fotos()) {
                MotoFoto foto = MotoFoto.builder()
                        .url(f.url())
                        .ordem(f.ordem() != null ? f.ordem() : 0)
                        .principal(f.principal() != null ? f.principal() : false)
                        .moto(moto)
                        .build();
                moto.getFotos().add(foto);
                urlsNovas.add(f.url());
            }
        }

        Moto salva = motoRepository.save(moto);

        // Remove do storage as fotos que deixaram de ser referenciadas
        urlsAntigas.stream()
                .filter(url -> !urlsNovas.contains(url))
                .forEach(storageService::deleteByPublicUrl);

        return salva;
    }

    public void excluir(UUID id) {
        Moto moto = obterPorId(id);
        List<String> urls = moto.getFotos().stream().map(MotoFoto::getUrl).toList();
        motoRepository.delete(moto);
        urls.forEach(storageService::deleteByPublicUrl);
    }
}
