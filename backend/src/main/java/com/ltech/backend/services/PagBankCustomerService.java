package com.ltech.backend.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ltech.backend.domain.entities.CustomerPagbank;
import com.ltech.backend.domain.entities.Usuario;
import com.ltech.backend.domain.repositories.CustomerPagbankRepository;
import com.ltech.backend.services.payment.PagBankService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class PagBankCustomerService {

    private final CustomerPagbankRepository customerPagbankRepository;
    private final PagBankService pagBankService;

    @Transactional
    public CustomerPagbank getOrCreateCustomer(Usuario usuario) {
        return customerPagbankRepository.findByUsuarioId(usuario.getId())
                .orElseGet(() -> criarCustomerNoPagBank(usuario));
    }

    public String getCustomerId(Usuario usuario) {
        return customerPagbankRepository.findByUsuarioId(usuario.getId())
                .map(CustomerPagbank::getCustomerIdPagbank)
                .orElse(null);
    }

    private CustomerPagbank criarCustomerNoPagBank(Usuario usuario) {
        String email = usuario.getUsername();
        String nome = usuario.getNomeCompleto() != null ? usuario.getNomeCompleto() : email;
        String taxId = usuario.getCpf() != null
                ? usuario.getCpf().replaceAll("\\D", "")
                : null;

        String pagBankCustomerId = pagBankService.criarCustomer(nome, email, taxId);

        CustomerPagbank customer = CustomerPagbank.builder()
                .usuarioId(usuario.getId())
                .usuario(usuario)
                .customerIdPagbank(pagBankCustomerId)
                .build();

        log.info("Customer PagBank vinculado ao usuario {}: customerId={}",
                usuario.getId(), pagBankCustomerId);
        return customerPagbankRepository.save(customer);
    }
}
