package com.ltech.backend.controllers;

import java.net.URI;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import com.ltech.backend.domain.dtos.ClienteRegisterRequestDTO;
import com.ltech.backend.domain.dtos.LoginRequestDTO;
import com.ltech.backend.domain.dtos.LoginResponseDTO;
import com.ltech.backend.domain.dtos.RegisterRequestDTO;
import com.ltech.backend.domain.dtos.RegisterResponseDTO;
import com.ltech.backend.domain.entities.Grupo;
import com.ltech.backend.domain.entities.Usuario;
import com.ltech.backend.domain.repositories.GrupoRepository;
import com.ltech.backend.security.TokenService;
import com.ltech.backend.security.UsuarioDetails;
import com.ltech.backend.services.UsuarioService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("auth")
@AllArgsConstructor
public class AuthenticationController {

    private AuthenticationManager authenticationManager;

    // private UsuarioRepository usuarioRepository;
    private UsuarioService usuarioService;

    private GrupoRepository grupoRepository;

    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> autenticarUsuario(@RequestBody @Valid LoginRequestDTO loginRequestDTO) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(loginRequestDTO.username(),
                loginRequestDTO.password());
        var auth = this.authenticationManager.authenticate(usernamePassword);
        var token = tokenService.generateToken((UsuarioDetails) auth.getPrincipal());
        return ResponseEntity.ok(new LoginResponseDTO(token));
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDTO> registrarUsuario(
            @RequestBody @Valid RegisterRequestDTO registerRequestDTO,
            UriComponentsBuilder uriBuilder) {

        if (this.usuarioService.existsByUsername(registerRequestDTO.username())) {
            return ResponseEntity.badRequest().build();
        }

        Grupo grupo = this.grupoRepository.findById(Long.parseLong(registerRequestDTO.grupoId())).orElse(null);
        String encryptedPassword = new BCryptPasswordEncoder().encode(registerRequestDTO.password());

        Usuario newUser = new Usuario(registerRequestDTO.username(), encryptedPassword, registerRequestDTO.enabled(),
                grupo);
        Usuario usuarioResponse = this.usuarioService.save(newUser);
        URI location = uriBuilder.path("/usuarios/{id}").buildAndExpand(usuarioResponse.getId()).toUri();

        return ResponseEntity.created(location).body(new RegisterResponseDTO(
                usuarioResponse.getUsername(),
                usuarioResponse.isEnabled(),
                usuarioResponse.getCreatedAt(),
                new RegisterResponseDTO.GrupoDTO(grupo != null ? grupo.getNome() : null)));
    }

    @PostMapping("/register/cliente")
    public ResponseEntity<RegisterResponseDTO> registrarCliente(
            @RequestBody @Valid ClienteRegisterRequestDTO dto,
            UriComponentsBuilder uriBuilder) {

        if (this.usuarioService.existsByUsername(dto.username())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }

        if (this.usuarioService.existsByCpf(dto.cpf())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");
        }

        Grupo grupoGeral = this.grupoRepository.findByNome("GERAL")
                .orElseThrow(() -> new RuntimeException("Grupo GERAL não encontrado"));

        String encryptedPassword = new BCryptPasswordEncoder().encode(dto.password());

        // numeroCnh não é coletado no cadastro; cliente informa depois no perfil/CNH.
        Usuario newUser = new Usuario(
                dto.username(), encryptedPassword, true, grupoGeral,
                dto.nomeCompleto(), dto.telefone(), dto.cpf(), null);
        newUser.setGenero(dto.genero());

        Usuario saved = this.usuarioService.save(newUser);
        URI location = uriBuilder.path("/usuarios/{id}").buildAndExpand(saved.getId()).toUri();

        return ResponseEntity.created(location).body(new RegisterResponseDTO(
                saved.getUsername(),
                saved.isEnabled(),
                saved.getCreatedAt(),
                new RegisterResponseDTO.GrupoDTO(grupoGeral.getNome())));
    }

    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        boolean available = !this.usuarioService.existsByUsername(email);
        return ResponseEntity.ok(Map.of("available", available));
    }

    @GetMapping("/check-cpf")
    public ResponseEntity<Map<String, Boolean>> checkCpf(@RequestParam String cpf) {
        boolean available = !this.usuarioService.existsByCpf(cpf);
        return ResponseEntity.ok(Map.of("available", available));
    }
}
