package com.ltech.backend.services;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ltech.backend.domain.dtos.CompleteRegisterRequestDTO;
import com.ltech.backend.domain.dtos.CreateCartaoDTO;
import com.ltech.backend.domain.dtos.CreateCnhDTO;
import com.ltech.backend.domain.dtos.CreateEnderecoCobrancaDTO;
import com.ltech.backend.domain.dtos.LoginResponseDTO;
import com.ltech.backend.domain.entities.Grupo;
import com.ltech.backend.domain.entities.Usuario;
import com.ltech.backend.domain.repositories.GrupoRepository;
import com.ltech.backend.security.TokenService;
import com.ltech.backend.security.UsuarioDetails;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class RegisterService {

    private final UsuarioService usuarioService;
    private final GrupoRepository grupoRepository;
    private final CnhService cnhService;
    private final CartaoService cartaoService;
    private final EnderecoCobrancaService enderecoCobrancaService;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    @Transactional
    public LoginResponseDTO registrarCompleto(CompleteRegisterRequestDTO dto) {
        if (usuarioService.existsByUsername(dto.username())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }
        if (usuarioService.existsByCpf(dto.cpf())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");
        }

        Grupo grupoGeral = grupoRepository.findByNome("GERAL")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Grupo GERAL não encontrado"));

        String encryptedPassword = passwordEncoder.encode(dto.password());

        Usuario usuario = new Usuario(
                dto.username(), encryptedPassword, true, grupoGeral,
                dto.nomeCompleto(), dto.telefone(), dto.cpf());
        usuario.setGenero(dto.genero());
        Usuario savedUsuario = usuarioService.save(usuario);

        cnhService.salvarCnh(
                new CreateCnhDTO(
                        dto.cnh().rg(),
                        dto.cnh().dataNascimento(),
                        dto.cnh().numeroRegistro(),
                        dto.cnh().numeroCnh(),
                        dto.cnh().dataValidade(),
                        dto.cnh().estado()),
                savedUsuario);

        var enderecoDTO = enderecoCobrancaService.salvarEndereco(
                new CreateEnderecoCobrancaDTO(
                        dto.endereco().cep(),
                        dto.endereco().logradouro(),
                        dto.endereco().numero(),
                        dto.endereco().semNumero(),
                        dto.endereco().complemento(),
                        dto.endereco().estado(),
                        dto.endereco().cidade(),
                        dto.endereco().bairro()),
                savedUsuario);

        var cartaoDTO = cartaoService.salvarCartao(
                new CreateCartaoDTO(
                        dto.cartao().nome(),
                        dto.cartao().cpf(),
                        dto.cartao().numero(),
                        dto.cartao().validade()),
                savedUsuario);

        cartaoService.associarEndereco(
                cartaoDTO.id().toString(),
                enderecoDTO.id().toString(),
                savedUsuario.getId());

        UsuarioDetails userDetails = new UsuarioDetails(savedUsuario);
        String token = tokenService.generateToken(userDetails);
        return new LoginResponseDTO(token);
    }
}
