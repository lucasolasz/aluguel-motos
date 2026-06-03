package com.ltech.backend.domain.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ltech.backend.domain.entities.Reserva;

public interface ReservaRepository extends JpaRepository<Reserva, UUID> {

    boolean existsByCartaoId(UUID cartaoId);

    List<Reserva> findByUsuarioIdOrderByCreatedAtDesc(String usuarioId);

    List<Reserva> findAllByOrderByCreatedAtDesc();

    int countByUsuarioId(String usuarioId);

    @Query("""
        SELECT COUNT(r) FROM Reserva r
        WHERE r.usuario.id = :usuarioId
          AND r.status = com.ltech.backend.domain.entities.StatusReserva.AGUARDANDO_RETIRADA
    """)
    int countPendentesByUsuario(@Param("usuarioId") String usuarioId);

    @Query("""
        SELECT r FROM Reserva r
        WHERE r.moto.id = :motoId
          AND r.status IN (
              com.ltech.backend.domain.entities.StatusReserva.AGUARDANDO_RETIRADA,
              com.ltech.backend.domain.entities.StatusReserva.EM_ANDAMENTO
          )
          AND r.dataRetirada <= :fim
          AND r.dataDevolucao >= :inicio
    """)
    List<Reserva> findOverlapping(
            @Param("motoId") UUID motoId,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim);

    @Query("""
        SELECT DISTINCT r.moto.id FROM Reserva r
        WHERE r.status IN (
              com.ltech.backend.domain.entities.StatusReserva.AGUARDANDO_RETIRADA,
              com.ltech.backend.domain.entities.StatusReserva.EM_ANDAMENTO
          )
          AND r.dataRetirada <= :fim
          AND r.dataDevolucao >= :inicio
    """)
    List<UUID> findMotoIdsOcupados(
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim);

    @Query("""
        SELECT DISTINCT r.cartao.id FROM Reserva r
        WHERE r.cartao IS NOT NULL AND r.cartao.id IN :cartaoIds
    """)
    List<UUID> findCartaoIdsWithReservas(@Param("cartaoIds") List<UUID> cartaoIds);
}
