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
import com.ltech.backend.domain.entities.Pagamento;
import com.ltech.backend.domain.entities.Reserva;
import com.ltech.backend.domain.entities.StatusPagamento;
import com.ltech.backend.domain.entities.StatusReserva;
import com.ltech.backend.domain.entities.TipoAssinatura;
import com.ltech.backend.domain.entities.TipoPagamento;
import com.ltech.backend.domain.entities.TipoVistoria;
import com.ltech.backend.domain.entities.Vistoria;
import com.ltech.backend.domain.entities.VistoriaFoto;
import com.ltech.backend.domain.repositories.CnhRepository;
import com.ltech.backend.domain.repositories.ContratoRepository;
import com.ltech.backend.domain.repositories.MotoRepository;
import com.ltech.backend.domain.repositories.PagamentoRepository;
import com.ltech.backend.domain.repositories.ReservaRepository;
import com.ltech.backend.domain.repositories.VistoriaRepository;
import com.ltech.backend.services.payment.PagamentoResult;
import com.ltech.backend.services.payment.PaymentService;
import com.ltech.backend.services.storage.StorageService;

import lombok.AllArgsConstructor;

/**
 * Atendimento presencial: retirada (CNH, pagamento, vistoria de saída, contrato,
 * conclusão → EM_ANDAMENTO) e devolução (vistoria de retorno, acerto de caução,
 * conclusão → CONCLUIDA).
 */
@Service
@AllArgsConstructor
public class AtendimentoService {

    private final ReservaRepository reservaRepository;
    private final CnhRepository cnhRepository;
    private final PagamentoRepository pagamentoRepository;
    private final VistoriaRepository vistoriaRepository;
    private final ContratoRepository contratoRepository;
    private final MotoRepository motoRepository;
    private final PaymentService paymentService;
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

        if (!temPagamento(reserva, TipoPagamento.ALUGUEL, StatusPagamento.PAGO)) {
            PagamentoResult r = paymentService.cobrarAluguel(reserva, reserva.getTotal(), cvv);
            registrarPagamento(reserva, TipoPagamento.ALUGUEL,
                    r.sucesso() ? StatusPagamento.PAGO : StatusPagamento.FALHOU,
                    reserva.getTotal(), r);
        }

        if (!temPagamento(reserva, TipoPagamento.CAUCAO, StatusPagamento.AUTORIZADO)) {
            PagamentoResult r = paymentService.autorizarCaucao(reserva, reserva.getCaucao(), cvv);
            registrarPagamento(reserva, TipoPagamento.CAUCAO,
                    r.sucesso() ? StatusPagamento.AUTORIZADO : StatusPagamento.FALHOU,
                    reserva.getCaucao(), r);
        }

        return detalhe(reserva);
    }

    @Transactional
    public ReservaDetalheDTO registrarVistoria(String id, CriarVistoriaDTO dto) {
        Reserva reserva = carregarReserva(id);
        TipoVistoria tipo = parseEnum(TipoVistoria.class, dto.tipo(), "tipo");
        NivelCombustivel nivel = dto.nivelCombustivel() == null || dto.nivelCombustivel().isBlank()
                ? null
                : parseEnum(NivelCombustivel.class, dto.nivelCombustivel(), "nivelCombustivel");

        if (vistoriaRepository.findFirstByReservaIdAndTipoOrderByCreatedAtDesc(reserva.getId(), tipo).isPresent()) {
            throw unprocessable("Já existe vistoria de " + tipo.name().toLowerCase() + " registrada para esta reserva");
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

        if (tipo == TipoAssinatura.MANUAL && (dto.urlDocumento() == null || dto.urlDocumento().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Assinatura manual requer o documento escaneado (urlDocumento)");
        }
        if (tipo == TipoAssinatura.DIGITAL && (dto.assinaturaUrl() == null || dto.assinaturaUrl().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Assinatura digital requer a imagem da assinatura (assinaturaUrl)");
        }

        Contrato contrato = contratoRepository.findFirstByReservaIdOrderByCreatedAtDesc(reserva.getId())
                .orElseGet(() -> Contrato.builder().reserva(reserva).build());
        String urlDocumentoAntiga = contrato.getUrlDocumento();
        String assinaturaUrlAntiga = contrato.getAssinaturaUrl();
        contrato.setTipoAssinatura(tipo);
        contrato.setUrlDocumento(dto.urlDocumento());
        contrato.setAssinaturaUrl(dto.assinaturaUrl());
        contrato.setAssinadoEm(LocalDateTime.now());
        contratoRepository.save(contrato);

        // Remove do storage os arquivos antigos que deixaram de ser referenciados (evita orfaos)
        removerSeDesreferenciado(urlDocumentoAntiga, dto.urlDocumento());
        removerSeDesreferenciado(assinaturaUrlAntiga, dto.assinaturaUrl());

        return detalhe(reserva);
    }

    /** Remove a url antiga do storage se ela foi sobrescrita por outra (ou removida). */
    private void removerSeDesreferenciado(String urlAntiga, String urlNova) {
        if (urlAntiga != null && !urlAntiga.equals(urlNova)) {
            storageService.deleteByPublicUrl(urlAntiga);
        }
    }

    @Transactional
    public ReservaDetalheDTO concluirRetirada(String id) {
        Reserva reserva = carregarReserva(id);

        if (reserva.getStatus() != StatusReserva.PENDENTE && reserva.getStatus() != StatusReserva.CONFIRMADA) {
            throw unprocessable("Retirada só pode ser concluída para reservas PENDENTE ou CONFIRMADA");
        }
        if (!Boolean.TRUE.equals(reserva.getCnhVerificada())) {
            throw unprocessable("CNH ainda não foi verificada");
        }
        if (vistoriaRepository.findFirstByReservaIdAndTipoOrderByCreatedAtDesc(
                reserva.getId(), TipoVistoria.SAIDA).isEmpty()) {
            throw unprocessable("Vistoria de saída ainda não foi registrada");
        }
        Contrato contrato = contratoRepository.findFirstByReservaIdOrderByCreatedAtDesc(reserva.getId())
                .orElse(null);
        if (contrato == null || contrato.getAssinadoEm() == null) {
            throw unprocessable("Contrato ainda não foi assinado");
        }
        if (!temPagamento(reserva, TipoPagamento.ALUGUEL, StatusPagamento.PAGO)) {
            throw unprocessable("Aluguel ainda não foi pago");
        }
        if (!temPagamento(reserva, TipoPagamento.CAUCAO, StatusPagamento.AUTORIZADO)) {
            throw unprocessable("Caução ainda não foi autorizada");
        }

        reserva.setStatus(StatusReserva.EM_ANDAMENTO);
        reserva.setRetiradaConcluidaEm(LocalDateTime.now());
        reservaRepository.save(reserva);
        return detalhe(reserva);
    }

    @Transactional
    public ReservaDetalheDTO acertarCaucao(String id, AcertarCaucaoDTO dto) {
        Reserva reserva = carregarReserva(id);

        Pagamento caucao = pagamentoRepository
                .findFirstByReservaIdAndTipoOrderByCreatedAtDesc(reserva.getId(), TipoPagamento.CAUCAO)
                .orElseThrow(() -> unprocessable("Não há caução registrada para esta reserva"));

        if (caucao.getStatus() != StatusPagamento.AUTORIZADO) {
            throw unprocessable("Caução já foi acertada (status: " + caucao.getStatus() + ")");
        }

        BigDecimal desconto = dto.valorDescontoCaucao() != null ? dto.valorDescontoCaucao() : BigDecimal.ZERO;

        if (desconto.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Valor de desconto não pode ser negativo");
        }
        if (desconto.compareTo(caucao.getValor()) > 0) {
            throw unprocessable("Valor de desconto (" + desconto + ") excede a caução autorizada (" + caucao.getValor() + ")");
        }

        if (desconto.compareTo(BigDecimal.ZERO) > 0) {
            PagamentoResult r = paymentService.capturarCaucao(caucao, desconto);
            caucao.setStatus(r.sucesso() ? StatusPagamento.CAPTURADO : StatusPagamento.FALHOU);
            caucao.setValor(desconto);
            caucao.setGatewayTransactionId(r.gatewayTransactionId());
        } else {
            PagamentoResult r = paymentService.liberarCaucao(caucao);
            caucao.setStatus(r.sucesso() ? StatusPagamento.LIBERADO : StatusPagamento.FALHOU);
            caucao.setGatewayTransactionId(r.gatewayTransactionId());
        }
        pagamentoRepository.save(caucao);

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

        Pagamento caucao = pagamentoRepository
                .findFirstByReservaIdAndTipoOrderByCreatedAtDesc(reserva.getId(), TipoPagamento.CAUCAO)
                .orElseThrow(() -> unprocessable("Não há caução registrada para esta reserva"));

        if (caucao.getStatus() != StatusPagamento.CAPTURADO
                && caucao.getStatus() != StatusPagamento.LIBERADO) {
            throw unprocessable("Caução ainda não foi acertada. Use /acertar-caucao antes de concluir a devolução.");
        }

        reserva.setStatus(StatusReserva.CONCLUIDA);
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva não encontrada"));
    }

    private ReservaDetalheDTO detalhe(Reserva reserva) {
        Cnh cnh = cnhRepository.findByUsuarioId(reserva.getUsuario().getId()).orElse(null);
        List<Pagamento> pagamentos = pagamentoRepository.findByReservaIdOrderByCreatedAtAsc(reserva.getId());
        List<Vistoria> vistorias = vistoriaRepository.findByReservaIdOrderByCreatedAtAsc(reserva.getId());
        Contrato contrato = contratoRepository.findFirstByReservaIdOrderByCreatedAtDesc(reserva.getId())
                .orElse(null);
        return ReservaDetalheDTO.from(reserva, cnh, pagamentos, vistorias, contrato);
    }

    private boolean temPagamento(Reserva reserva, TipoPagamento tipo, StatusPagamento status) {
        return pagamentoRepository.findFirstByReservaIdAndTipoOrderByCreatedAtDesc(reserva.getId(), tipo)
                .map(p -> p.getStatus() == status)
                .orElse(false);
    }

    private void registrarPagamento(Reserva reserva, TipoPagamento tipo, StatusPagamento status,
            BigDecimal valor, PagamentoResult r) {
        pagamentoRepository.save(Pagamento.builder()
                .reserva(reserva)
                .tipo(tipo)
                .status(status)
                .valor(valor)
                .gatewayTransactionId(r.gatewayTransactionId())
                .metodo(r.metodo())
                .build());
    }

    private <E extends Enum<E>> E parseEnum(Class<E> type, String value, String field) {
        try {
            return Enum.valueOf(type, value.trim().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " inválido: " + value);
        }
    }

    private ResponseStatusException unprocessable(String msg) {
        return new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, msg);
    }
}
