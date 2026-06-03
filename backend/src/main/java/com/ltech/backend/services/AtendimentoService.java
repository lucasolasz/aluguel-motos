package com.ltech.backend.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ltech.backend.domain.dtos.AcertarCaucaoDTO;
import com.ltech.backend.domain.dtos.ConcluirDevolucaoDTO;
import com.ltech.backend.domain.dtos.CriarVistoriaDTO;
import com.ltech.backend.domain.dtos.ReservaDetalheDTO;
import com.ltech.backend.domain.dtos.SalvarContratoDTO;
import com.ltech.backend.domain.entities.Cnh;
import com.ltech.backend.domain.entities.Contrato;
import com.ltech.backend.domain.entities.NivelCombustivel;
import com.ltech.backend.domain.entities.Reserva;
import com.ltech.backend.domain.entities.StatusReserva;
import com.ltech.backend.domain.entities.TipoAssinatura;
import com.ltech.backend.domain.entities.TipoVistoria;
import com.ltech.backend.domain.entities.TransacaoPagbank;
import com.ltech.backend.domain.entities.Vistoria;
import com.ltech.backend.domain.entities.VistoriaFoto;
import com.ltech.backend.domain.repositories.CnhRepository;
import com.ltech.backend.domain.repositories.ContratoRepository;
import com.ltech.backend.domain.repositories.MotoRepository;
import com.ltech.backend.domain.repositories.ReservaRepository;
import com.ltech.backend.domain.repositories.TransacaoPagbankRepository;
import com.ltech.backend.domain.repositories.VistoriaRepository;
import com.ltech.backend.services.storage.StorageService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class AtendimentoService {

    private final ReservaRepository reservaRepository;
    private final CnhRepository cnhRepository;
    private final TransacaoPagbankRepository transacaoPagbankRepository;
    private final VistoriaRepository vistoriaRepository;
    private final ContratoRepository contratoRepository;
    private final MotoRepository motoRepository;
    private final CobrancaService cobrancaService;
    private final StorageService storageService;

    @Transactional(readOnly = true)
    public ReservaDetalheDTO buscarDetalhe(String id) {
        return detalhe(carregarReserva(id));
    }

    @Transactional
    public ReservaDetalheDTO marcarCnhVerificada(String id, String adminNome) {
        Reserva reserva = carregarReserva(id);
        reserva.setCnhVerificada(true);
        reserva.setCnhVerificadaPor(adminNome);
        reserva.setCnhVerificadaEm(LocalDateTime.now());
        reservaRepository.save(reserva);
        return detalhe(reserva);
    }

    @Transactional
    public ReservaDetalheDTO cobrar(String id, String cvv) {
        Reserva reserva = carregarReserva(id);

        if (!Boolean.TRUE.equals(reserva.getCnhVerificada())) {
            throw unprocessable("Verifique a CNH antes de cobrar");
        }
        if (vistoriaRepository.findFirstByReservaIdAndTipoOrderByCreatedAtDesc(
                reserva.getId(), TipoVistoria.SAIDA).isEmpty()) {
            throw unprocessable("Registre a vistoria de saída antes de cobrar");
        }
        Contrato contrato = contratoRepository.findFirstByReservaIdOrderByCreatedAtDesc(reserva.getId())
                .orElse(null);
        if (contrato == null || contrato.getAssinadoEm() == null) {
            throw unprocessable("Assine o contrato antes de cobrar");
        }

        TransacaoPagbank aluguel = transacaoPagbankRepository
                .findFirstByReservaIdAndTipoOrderByCreatedAtDesc(
                        reserva.getId(), TransacaoPagbank.Tipo.ALUGUEL)
                .orElse(null);

        if (aluguel == null || aluguel.getStatus() != TransacaoPagbank.Status.PAID) {
            Integer aluguelCentavos = reserva.getTotal()
                    .multiply(BigDecimal.valueOf(100)).intValue();
            aluguel = cobrancaService.cobrarAluguel(reserva, aluguelCentavos, cvv);

            if (aluguel.getStatus() == TransacaoPagbank.Status.DECLINED) {
                throw unprocessable("Aluguel recusado pelo gateway de pagamento");
            }
        }

        TransacaoPagbank caucao = transacaoPagbankRepository
                .findFirstByReservaIdAndTipoOrderByCreatedAtDesc(
                        reserva.getId(), TransacaoPagbank.Tipo.CAUCAO_PRE_AUTH)
                .orElse(null);

        if (caucao == null || caucao.getStatus() != TransacaoPagbank.Status.AUTHORIZED) {
            Integer caucaoCentavos = reserva.getCaucao()
                    .multiply(BigDecimal.valueOf(100)).intValue();
            caucao = cobrancaService.autorizarCaucao(reserva, caucaoCentavos, cvv);

            if (caucao.getStatus() == TransacaoPagbank.Status.DECLINED) {
                Integer aluguelCentavos = aluguel.getValorCentavos();
                log.warn("Caução recusada na reserva {}. Estornando aluguel.", reserva.getId());
                cobrancaService.estornar(aluguel, aluguelCentavos);
                throw unprocessable("Caução recusada. Aluguel foi estornado.");
            }
        }

        reserva.setValorAluguelCentavos(aluguel.getValorCentavos());
        reserva.setValorCaucaoCentavos(caucao.getValorCentavos());
        reservaRepository.save(reserva);

        return detalhe(reserva);
    }

    @Transactional
    public ReservaDetalheDTO registrarVistoria(String id, CriarVistoriaDTO dto) {
        Reserva reserva = carregarReserva(id);
        TipoVistoria tipo = parseEnum(TipoVistoria.class, dto.tipo(), "tipo");
        NivelCombustivel nivel = dto.nivelCombustivel() == null || dto.nivelCombustivel().isBlank()
                ? null
                : parseEnum(NivelCombustivel.class, dto.nivelCombustivel(), "nivelCombustivel");

        if (vistoriaRepository.findFirstByReservaIdAndTipoOrderByCreatedAtDesc(
                reserva.getId(), tipo).isPresent()) {
            throw unprocessable("Já existe vistoria de " + tipo.name().toLowerCase()
                    + " registrada para esta reserva");
        }

        Vistoria vistoria = Vistoria.builder()
                .reserva(reserva)
                .tipo(tipo)
                .kmRegistrado(dto.kmRegistrado())
                .nivelCombustivel(nivel)
                .observacoes(dto.observacoes())
                .build();

        List<VistoriaFoto> fotos = new ArrayList<>();
        if (dto.fotos() != null) {
            int ordem = 0;
            for (String url : dto.fotos()) {
                if (url == null || url.isBlank()) continue;
                fotos.add(VistoriaFoto.builder()
                        .vistoria(vistoria)
                        .url(url)
                        .ordem(ordem++)
                        .build());
            }
        }
        vistoria.getFotos().addAll(fotos);
        vistoriaRepository.save(vistoria);

        if (dto.kmRegistrado() != null) {
            reserva.getMoto().setKmAtual(dto.kmRegistrado());
            motoRepository.save(reserva.getMoto());
        }

        return detalhe(reserva);
    }

    @Transactional
    public ReservaDetalheDTO salvarContrato(String id, SalvarContratoDTO dto) {
        Reserva reserva = carregarReserva(id);
        TipoAssinatura tipo = parseEnum(TipoAssinatura.class, dto.tipoAssinatura(), "tipoAssinatura");

        if (tipo == TipoAssinatura.MANUAL
                && (dto.urlDocumento() == null || dto.urlDocumento().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Assinatura manual requer o documento escaneado (urlDocumento)");
        }
        if (tipo == TipoAssinatura.DIGITAL
                && (dto.assinaturaUrl() == null || dto.assinaturaUrl().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Assinatura digital requer a imagem da assinatura (assinaturaUrl)");
        }

        Contrato contrato = contratoRepository
                .findFirstByReservaIdOrderByCreatedAtDesc(reserva.getId())
                .orElseGet(() -> Contrato.builder().reserva(reserva).build());
        String urlDocumentoAntiga = contrato.getUrlDocumento();
        String assinaturaUrlAntiga = contrato.getAssinaturaUrl();
        contrato.setTipoAssinatura(tipo);
        contrato.setUrlDocumento(dto.urlDocumento());
        contrato.setAssinaturaUrl(dto.assinaturaUrl());
        contrato.setAssinadoEm(LocalDateTime.now());
        contratoRepository.save(contrato);

        removerSeDesreferenciado(urlDocumentoAntiga, dto.urlDocumento());
        removerSeDesreferenciado(assinaturaUrlAntiga, dto.assinaturaUrl());

        return detalhe(reserva);
    }

    private void removerSeDesreferenciado(String urlAntiga, String urlNova) {
        if (urlAntiga != null && !urlAntiga.equals(urlNova)) {
            storageService.deleteByPublicUrl(urlAntiga);
        }
    }

    @Transactional
    public ReservaDetalheDTO concluirRetirada(String id) {
        Reserva reserva = carregarReserva(id);

        if (reserva.getStatus() != StatusReserva.AGUARDANDO_RETIRADA) {
            throw unprocessable("Retirada só pode ser concluída para reservas AGUARDANDO_RETIRADA");
        }
        if (!Boolean.TRUE.equals(reserva.getCnhVerificada())) {
            throw unprocessable("CNH ainda não foi verificada");
        }
        if (vistoriaRepository.findFirstByReservaIdAndTipoOrderByCreatedAtDesc(
                reserva.getId(), TipoVistoria.SAIDA).isEmpty()) {
            throw unprocessable("Vistoria de saída ainda não foi registrada");
        }
        Contrato contrato = contratoRepository
                .findFirstByReservaIdOrderByCreatedAtDesc(reserva.getId()).orElse(null);
        if (contrato == null || contrato.getAssinadoEm() == null) {
            throw unprocessable("Contrato ainda não foi assinado");
        }
        if (!temTransacao(reserva, TransacaoPagbank.Tipo.ALUGUEL, TransacaoPagbank.Status.PAID)) {
            throw unprocessable("Aluguel ainda não foi pago");
        }
        if (!temTransacao(reserva, TransacaoPagbank.Tipo.CAUCAO_PRE_AUTH,
                TransacaoPagbank.Status.AUTHORIZED)) {
            throw unprocessable("Caução ainda não foi autorizada");
        }

        reserva.setStatus(StatusReserva.EM_ANDAMENTO);
        reserva.setRetiradaConcluidaEm(LocalDateTime.now());
        reserva.getMoto().setDisponivel(false);
        motoRepository.save(reserva.getMoto());
        reservaRepository.save(reserva);
        return detalhe(reserva);
    }

    @Transactional
    public ReservaDetalheDTO acertarCaucao(String id, AcertarCaucaoDTO dto) {
        Reserva reserva = carregarReserva(id);

        TransacaoPagbank caucao = transacaoPagbankRepository
                .findFirstByReservaIdAndTipoOrderByCreatedAtDesc(
                        reserva.getId(), TransacaoPagbank.Tipo.CAUCAO_PRE_AUTH)
                .orElseThrow(() -> unprocessable("Não há caução registrada para esta reserva"));

        if (caucao.getStatus() != TransacaoPagbank.Status.AUTHORIZED) {
            throw unprocessable("Caução já foi acertada (status: " + caucao.getStatus() + ")");
        }

        BigDecimal desconto = dto.valorDescontoCaucao() != null
                ? dto.valorDescontoCaucao() : BigDecimal.ZERO;

        if (desconto.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Valor de desconto não pode ser negativo");
        }

        Integer caucaoCentavos = caucao.getValorCentavos();
        Integer descontoCentavos = desconto.multiply(BigDecimal.valueOf(100)).intValue();

        if (descontoCentavos > caucaoCentavos) {
            throw unprocessable("Valor de desconto excede a caução autorizada");
        }

        if (descontoCentavos > 0) {
            cobrancaService.capturarCaucao(caucao, descontoCentavos);
        } else {
            cobrancaService.cancelarCaucao(caucao);
        }

        return detalhe(reserva);
    }

    @Transactional
    public ReservaDetalheDTO concluirDevolucao(String id, ConcluirDevolucaoDTO dto) {
        Reserva reserva = carregarReserva(id);

        if (reserva.getStatus() != StatusReserva.EM_ANDAMENTO) {
            throw unprocessable("Devolução só pode ser concluída para reservas EM_ANDAMENTO");
        }
        if (vistoriaRepository.findFirstByReservaIdAndTipoOrderByCreatedAtDesc(
                reserva.getId(), TipoVistoria.RETORNO).isEmpty()) {
            throw unprocessable("Vistoria de retorno ainda não foi registrada");
        }

        TransacaoPagbank caucao = transacaoPagbankRepository
                .findFirstByReservaIdAndTipoOrderByCreatedAtDesc(
                        reserva.getId(), TransacaoPagbank.Tipo.CAUCAO_PRE_AUTH)
                .orElseThrow(() -> unprocessable("Não há caução registrada para esta reserva"));

        boolean caucaoOk = caucao.getStatus() == TransacaoPagbank.Status.CANCELED
                || caucao.getStatus() == TransacaoPagbank.Status.PAID;

        if (!caucaoOk) {
            throw unprocessable("Caução ainda não foi acertada. Use /acertar-caucao antes de concluir a devolução.");
        }

        reserva.setStatus(StatusReserva.FINALIZADA);
        reserva.setDevolucaoConcluidaEm(LocalDateTime.now());
        reserva.getMoto().setDisponivel(true);
        motoRepository.save(reserva.getMoto());
        reservaRepository.save(reserva);
        return detalhe(reserva);
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private Reserva carregarReserva(String id) {
        UUID uuid;
        try {
            uuid = UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id inválido");
        }
        return reservaRepository.findById(uuid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Reserva não encontrada"));
    }

    private ReservaDetalheDTO detalhe(Reserva reserva) {
        Cnh cnh = cnhRepository.findByUsuarioId(reserva.getUsuario().getId()).orElse(null);
        List<TransacaoPagbank> transacoes = transacaoPagbankRepository
                .findByReservaIdOrderByCreatedAtAsc(reserva.getId());
        List<Vistoria> vistorias = vistoriaRepository
                .findByReservaIdOrderByCreatedAtAsc(reserva.getId());
        Contrato contrato = contratoRepository
                .findFirstByReservaIdOrderByCreatedAtDesc(reserva.getId()).orElse(null);
        return ReservaDetalheDTO.from(reserva, cnh, transacoes, vistorias, contrato);
    }

    private boolean temTransacao(Reserva reserva, TransacaoPagbank.Tipo tipo,
                                  TransacaoPagbank.Status status) {
        return transacaoPagbankRepository
                .findFirstByReservaIdAndTipoOrderByCreatedAtDesc(reserva.getId(), tipo)
                .map(t -> t.getStatus() == status)
                .orElse(false);
    }

    private <E extends Enum<E>> E parseEnum(Class<E> type, String value, String field) {
        try {
            return Enum.valueOf(type, value.trim().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    field + " inválido: " + value);
        }
    }

    private ResponseStatusException unprocessable(String msg) {
        return new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, msg);
    }
}
