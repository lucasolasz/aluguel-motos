package com.ltech.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ltech.backend.config.PagBankProperties;
import com.ltech.backend.domain.dtos.CartaoDTO;
import com.ltech.backend.domain.dtos.CreateCartaoDTO;
import com.ltech.backend.domain.entities.Cartao;
import com.ltech.backend.domain.entities.EnderecoCobranca;
import com.ltech.backend.domain.entities.Usuario;
import com.ltech.backend.domain.repositories.CartaoRepository;
import com.ltech.backend.domain.repositories.EnderecoCobrancaRepository;
import com.ltech.backend.domain.repositories.ReservaRepository;
import com.ltech.backend.services.payment.PagBankService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CartaoService {

    private CartaoRepository cartaoRepository;
    private EnderecoCobrancaRepository enderecoCobrancaRepository;
    private ReservaRepository reservaRepository;
    private CartaoFingerprintService cartaoFingerprintService;
    private PagBankService pagBankService;
    private PagBankProperties pagBankProperties;

    public List<CartaoDTO> listarMeusCartoes(String usuarioId) {
        List<Cartao> cartoes = cartaoRepository.findByUsuarioIdOrderByCreatedAtDesc(usuarioId);
        if (cartoes.isEmpty()) {
            return List.of();
        }
        List<UUID> cartaoIds = cartoes.stream().map(Cartao::getId).toList();
        List<UUID> comReservas = reservaRepository.findCartaoIdsWithReservas(cartaoIds);
        java.util.Set<UUID> reservados = new java.util.HashSet<>(comReservas);
        return cartoes.stream()
                .map(c -> CartaoDTO.from(c, reservados.contains(c.getId())))
                .toList();
    }

    public CartaoDTO salvarCartao(CreateCartaoDTO dto, Usuario usuario) {
        if (pagBankProperties.isEnabled()) {
            return salvarCartaoPagBank(dto, usuario);
        } else {
            return salvarCartaoLegacy(dto, usuario);
        }
    }

    private CartaoDTO salvarCartaoPagBank(CreateCartaoDTO dto, Usuario usuario) {
        if (dto.encrypted() == null || dto.encrypted().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Dados criptografados do cartão são obrigatórios");
        }

        PagBankService.TokenizeResult result;
        try {
            result = pagBankService.tokenizarCartao(dto.encrypted());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cartão recusado pela operadora: " + e.getMessage());
        }

        if (result.id() == null || result.id().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Tokenização do cartão falhou: token vazio");
        }

        String fingerprint = cartaoFingerprintService.gerar(result.id());

        if (cartaoRepository.existsByUsuarioIdAndFingerprint(usuario.getId(), fingerprint)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cartão já cadastrado");
        }

        String mascarado = "**** " + (result.lastDigits() != null ? result.lastDigits() : "****");
        String validade = null;
        if (result.expMonth() != null && result.expYear() != null) {
            validade = result.expMonth() + "/" + result.expYear();
        }

        Cartao cartao = Cartao.builder()
                .usuario(usuario)
                .nome(dto.nome() != null ? dto.nome() : result.holderName())
                .numeroMascarado(mascarado)
                .validade(validade)
                .cpf(dto.cpf() != null ? dto.cpf() : result.holderTaxId())
                .fingerprint(fingerprint)
                .tokenPagBank(result.id())
                .bandeira(result.brand())
                .build();
        return CartaoDTO.from(cartaoRepository.save(cartao));
    }

    private CartaoDTO salvarCartaoLegacy(CreateCartaoDTO dto, Usuario usuario) {
        if (dto.numero() == null || dto.numero().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Número do cartão é obrigatório no modo legado");
        }

        String numero = dto.numero().replaceAll("\\D", "");
        String fingerprint = cartaoFingerprintService.gerar(numero);

        if (cartaoRepository.existsByUsuarioIdAndFingerprint(usuario.getId(), fingerprint)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cartão já cadastrado");
        }

        String mascarado = "**** " + numero.substring(Math.max(0, numero.length() - 4));

        Cartao cartao = Cartao.builder()
                .usuario(usuario)
                .nome(dto.nome())
                .numeroMascarado(mascarado)
                .validade(dto.validade())
                .cpf(dto.cpf())
                .fingerprint(fingerprint)
                .build();
        return CartaoDTO.from(cartaoRepository.save(cartao));
    }

    public void deletarCartao(String cartaoId, String usuarioId) {
        Cartao cartao = cartaoRepository.findById(UUID.fromString(cartaoId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cartão não encontrado"));
        if (!cartao.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão");
        }
        if (reservaRepository.existsByCartaoId(UUID.fromString(cartaoId))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cartão vinculado a reservas. Não pode ser excluído.");
        }
        cartaoRepository.deleteById(UUID.fromString(cartaoId));
    }

    public CartaoDTO associarEndereco(String cartaoId, String enderecoId, String usuarioId) {
        Cartao cartao = cartaoRepository.findById(UUID.fromString(cartaoId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cartão não encontrado"));

        if (!cartao.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão");
        }

        EnderecoCobranca endereco = enderecoCobrancaRepository.findById(UUID.fromString(enderecoId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Endereço não encontrado"));

        if (!endereco.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão");
        }

        cartao.setEnderecoCobranca(endereco);
        return CartaoDTO.from(cartaoRepository.save(cartao));
    }
}