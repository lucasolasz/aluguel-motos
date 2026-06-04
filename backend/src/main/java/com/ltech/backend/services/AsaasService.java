package com.ltech.backend.services;

import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import com.ltech.backend.domain.dtos.CompleteRegisterRequestDTO.EnderecoData;
import com.ltech.backend.domain.dtos.asaas.AsaasCustomerListResponse;
import com.ltech.backend.domain.dtos.asaas.AsaasCustomerRequest;
import com.ltech.backend.domain.dtos.asaas.AsaasCustomerResponse;
import com.ltech.backend.domain.dtos.asaas.AsaasPaymentRequest;
import com.ltech.backend.domain.dtos.asaas.AsaasPaymentRequest.CreditCard;
import com.ltech.backend.domain.dtos.asaas.AsaasPaymentRequest.CreditCardHolderInfo;
import com.ltech.backend.domain.dtos.asaas.AsaasPaymentResponse;
import com.ltech.backend.domain.entities.Cartao;
import com.ltech.backend.domain.entities.Endereco;
import com.ltech.backend.domain.entities.Reserva;
import com.ltech.backend.domain.entities.Usuario;

@Service
public class AsaasService {

    private final RestClient restClient;
    private final String baseUrl;

    public AsaasService(
            @Value("${asaas.base-url}") String baseUrl,
            @Value("${asaas.api-key}") String apiKey) {
        this.baseUrl = baseUrl;
        this.restClient = RestClient.builder()
                .defaultHeader("access_token", apiKey)
                .defaultHeader("accept", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public String buscarOuCriarCliente(Usuario usuario, EnderecoData enderecoUsuario) {
        String cpf = usuario.getCpf();

        AsaasCustomerListResponse lista = restClient.get()
                .uri(baseUrl + "/customers?limit=1&cpfCnpj={cpf}", cpf)
                .retrieve()
                .onStatus(status -> !status.is2xxSuccessful(), (req, res) -> {
                    throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                            "Erro ao consultar cliente Asaas: " + res.getStatusCode());
                })
                .body(AsaasCustomerListResponse.class);

        if (lista == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Resposta inválida da API Asaas");
        }

        if (lista.totalCount() > 0 && !lista.data().isEmpty()) {
            return lista.data().get(0).id();
        }

        return criarCliente(usuario, cpf, enderecoUsuario);
    }

    public AsaasPaymentResponse criarCobrancaCartao(Reserva reserva, String cvv) {
        Cartao cartao = reserva.getCartao();
        if (cartao == null) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Reserva não possui cartão associado");
        }

        Usuario usuario = reserva.getUsuario();
        String customerId = usuario.getClienteAsass() != null
                ? usuario.getClienteAsass().getCustomerId()
                : null;
        if (customerId == null) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Cliente não possui cadastro no Asaas");
        }

        String[] validadeParts = cartao.getValidade().split("/");
        String expiryMonth = validadeParts[0];
        String expiryYear = "20" + validadeParts[1];

        Endereco endereco = usuario.getEndereco();
        String cep = endereco != null ? endereco.getCep() : "";
        String numeroEndereco = endereco != null ? endereco.getNumero() : "";

        DateTimeFormatter fmtData = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter fmtHora = DateTimeFormatter.ofPattern("HH:mm");
        String description = String.format(
                "Aluguel da %s %s. Retirada em %s dia %s às %s, devolução em %s dia %s às %s.",
                reserva.getMoto().getMarca(),
                reserva.getMoto().getModelo(),
                reserva.getLocalRetirada().getNome(),
                reserva.getDataRetirada().format(fmtData),
                reserva.getHoraRetirada().format(fmtHora),
                reserva.getLocalDevolucao().getNome(),
                reserva.getDataDevolucao().format(fmtData),
                reserva.getHoraDevolucao().format(fmtHora));

        AsaasPaymentRequest request = new AsaasPaymentRequest(
                "CREDIT_CARD",
                customerId,
                reserva.getTotalAluguel(),
                reserva.getDataRetirada().toString(),
                description,
                new CreditCard(
                        cartao.getNome(),
                        cartao.getNumeroEncriptado(),
                        expiryMonth,
                        expiryYear,
                        cvv),
                new CreditCardHolderInfo(
                        usuario.getNomeCompleto(),
                        usuario.getUsername(),
                        usuario.getCpf(),
                        cep,
                        numeroEndereco,
                        buildPhone(usuario),
                        buildPhone(usuario)));

        AsaasPaymentResponse response = restClient.post()
                .uri(baseUrl + "/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .onStatus(status -> !status.is2xxSuccessful(), (req, res) -> {
                    throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                            "Erro ao cobrar no Asaas: " + res.getStatusCode());
                })
                .body(AsaasPaymentResponse.class);

        if (response == null || response.id() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Resposta inválida do Asaas ao cobrar");
        }

        return response;
    }

    private String criarCliente(Usuario usuario, String cpf, EnderecoData endereco) {
        AsaasCustomerRequest request = new AsaasCustomerRequest(
                usuario.getNomeCompleto(),
                cpf,
                usuario.getUsername(),
                buildPhone(usuario),
                endereco.logradouro(),
                endereco.numero(),
                endereco.complemento(),
                endereco.bairro(),
                endereco.cep(),
                usuario.getId(),
                false,
                false);

        AsaasCustomerResponse response = restClient.post()
                .uri(baseUrl + "/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .onStatus(status -> !status.is2xxSuccessful(), (req, res) -> {
                    throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                            "Erro ao criar cliente Asaas: " + res.getStatusCode());
                })
                .body(AsaasCustomerResponse.class);

        if (response == null || response.id() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "ID do cliente Asaas não retornado");
        }

        return response.id();
    }

    private String buildPhone(Usuario usuario) {
        String ddd = usuario.getDdd() != null ? usuario.getDdd() : "";
        String numero = usuario.getNumero() != null ? usuario.getNumero() : "";
        return ddd + numero;
    }
}
