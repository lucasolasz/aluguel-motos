package com.ltech.backend.services;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ltech.backend.domain.dtos.CartaoDTO;
import com.ltech.backend.domain.dtos.CreateCartaoDTO;
import com.ltech.backend.domain.entities.Cartao;
import com.ltech.backend.domain.entities.CustomerPagbank;
import com.ltech.backend.domain.entities.EnderecoCobranca;
import com.ltech.backend.domain.entities.Usuario;
import com.ltech.backend.domain.repositories.CartaoRepository;
import com.ltech.backend.domain.repositories.EnderecoCobrancaRepository;
import com.ltech.backend.domain.repositories.ReservaRepository;
import com.ltech.backend.services.payment.PagBankService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class CartaoService {

    private final CartaoRepository cartaoRepository;
    private final EnderecoCobrancaRepository enderecoCobrancaRepository;
    private final ReservaRepository reservaRepository;
    private final CartaoFingerprintService cartaoFingerprintService;
    private final CardEncryptionService cardEncryptionService;
    private final PagBankService pagBankService;
    private final PagBankCustomerService pagBankCustomerService;

    public List<CartaoDTO> listarMeusCartoes(String usuarioId) {
        List<Cartao> cartoes = cartaoRepository.findByUsuarioIdOrderByCreatedAtDesc(usuarioId);
        if (cartoes.isEmpty()) {
            return List.of();
        }
        List<UUID> cartaoIds = cartoes.stream().map(Cartao::getId).toList();
        List<UUID> comReservas = reservaRepository.findCartaoIdsWithReservas(cartaoIds);
        var reservados = new HashSet<>(comReservas);
        return cartoes.stream()
                .map(c -> {
                    String nome = dec(c.getNome());
                    String cpf = dec(c.getCpf());
                    return CartaoDTO.from(c, reservados.contains(c.getId()), nome, cpf);
                })
                .toList();
    }

    public CartaoDTO salvarCartao(CreateCartaoDTO dto, Usuario usuario) {
        if (dto.encrypted() == null || dto.encrypted().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Dados criptografados do cartão são obrigatórios");
        }

        CustomerPagbank customer = pagBankCustomerService.getOrCreateCustomer(usuario);

        PagBankService.TokenizeResult result;
        try {
            result = pagBankService.tokenizarCartao(dto.encrypted(),
                    customer != null ? customer.getCustomerIdPagbank() : null);
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

        String numeroMascarado = "**** " + (result.lastDigits() != null ? result.lastDigits() : "****");
        String validade = null;
        if (result.expMonth() != null && result.expYear() != null) {
            validade = result.expMonth() + "/" + result.expYear();
        }

        String nome = dto.nome() != null ? dto.nome() : result.holderName();
        String cpf = dto.cpf() != null ? dto.cpf() : result.holderTaxId();

        Cartao cartao = Cartao.builder()
                .usuario(usuario)
                .nome(enc(nome))
                .numeroMascarado(numeroMascarado)
                .validade(validade)
                .cpf(enc(cpf))
                .fingerprint(fingerprint)
                .tokenPagBank(result.id())
                .bandeira(result.brand())
                .apelido(dto.apelido())
                .ativo(true)
                .build();

        Cartao saved = cartaoRepository.save(cartao);
        log.info("Cartão salvo: id={} lastDigits={} apelido={}", saved.getId(),
                result.lastDigits(), dto.apelido() != null ? dto.apelido() : "-");
        return CartaoDTO.from(saved, false, nome, cpf);
    }

    public void deletarCartao(String cartaoId, String usuarioId) {
        Cartao cartao = cartaoRepository.findById(UUID.fromString(cartaoId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Cartão não encontrado"));
        if (!cartao.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão");
        }
        if (!Boolean.TRUE.equals(cartao.getAtivo())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cartão já está inativo");
        }
        cartao.setAtivo(false);
        cartaoRepository.save(cartao);
        log.info("Cartão desativado (soft delete): id={}", cartao.getId());
    }

    public CartaoDTO associarEndereco(String cartaoId, String enderecoId, String usuarioId) {
        Cartao cartao = cartaoRepository.findById(UUID.fromString(cartaoId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Cartão não encontrado"));

        if (!cartao.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão");
        }

        EnderecoCobranca endereco = enderecoCobrancaRepository.findById(UUID.fromString(enderecoId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Endereço não encontrado"));

        if (!endereco.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão");
        }

        cartao.setEnderecoCobranca(endereco);
        Cartao saved = cartaoRepository.save(cartao);
        return CartaoDTO.from(saved, false, dec(saved.getNome()), dec(saved.getCpf()));
    }

    private String enc(String value) {
        return value != null ? cardEncryptionService.encrypt(value) : null;
    }

    private String dec(String value) {
        return value != null ? cardEncryptionService.decrypt(value) : null;
    }
}
