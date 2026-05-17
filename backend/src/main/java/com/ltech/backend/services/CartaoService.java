package com.ltech.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ltech.backend.domain.dtos.CartaoDTO;
import com.ltech.backend.domain.dtos.CartaoValidarDTO;
import com.ltech.backend.domain.dtos.CreateCartaoDTO;
import com.ltech.backend.domain.entities.Cartao;
import com.ltech.backend.domain.entities.EnderecoCobranca;
import com.ltech.backend.domain.entities.Usuario;
import com.ltech.backend.domain.repositories.CartaoRepository;
import com.ltech.backend.domain.repositories.EnderecoCobrancaRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CartaoService {

    private CartaoRepository cartaoRepository;
    private EnderecoCobrancaRepository enderecoCobrancaRepository;
    private CartaoFingerprintService cartaoFingerprintService;

    public List<CartaoDTO> listarMeusCartoes(String usuarioId) {
        return cartaoRepository.findByUsuarioIdOrderByCreatedAtDesc(usuarioId)
                .stream()
                .map(CartaoDTO::from)
                .toList();
    }

    public void validarCartao(CartaoValidarDTO dto, Usuario usuario) {
        String numero = dto.numero().replaceAll("\\D", "");
        String fingerprint = cartaoFingerprintService.gerar(numero);
        if (cartaoRepository.existsByUsuarioIdAndFingerprint(usuario.getId(), fingerprint)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cartão já cadastrado");
        }
    }

    public CartaoDTO salvarCartao(CreateCartaoDTO dto, Usuario usuario) {
        String numero = dto.numero().replaceAll("\\D", "");
        String fingerprint = cartaoFingerprintService.gerar(numero);

        if (cartaoRepository.existsByUsuarioIdAndFingerprint(usuario.getId(), fingerprint)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cartão já cadastrado");
        }

        String mascarado = "****" + numero.substring(Math.max(0, numero.length() - 4));

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
