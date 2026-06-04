package com.ltech.backend.services;

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

    private String criarCliente(Usuario usuario, String cpf, EnderecoData endereco) {
        AsaasCustomerRequest request = new AsaasCustomerRequest(
                usuario.getNomeCompleto(),
                cpf,
                usuario.getUsername(),
                usuario.getTelefone(),
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
}
