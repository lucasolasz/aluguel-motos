package com.ltech.backend.controllers;

import java.net.URI;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.ltech.backend.domain.dtos.CompleteRegisterRequestDTO;
import com.ltech.backend.domain.dtos.LoginRequestDTO;
import com.ltech.backend.domain.dtos.LoginResponseDTO;
import com.ltech.backend.domain.dtos.RegisterRequestDTO;
import com.ltech.backend.domain.dtos.RegisterResponseDTO;
import com.ltech.backend.domain.entities.Grupo;
import com.ltech.backend.domain.entities.Usuario;
import com.ltech.backend.domain.repositories.GrupoRepository;
import com.ltech.backend.security.TokenService;
import com.ltech.backend.security.UsuarioDetails;
import com.ltech.backend.services.RegisterService;
import com.ltech.backend.services.UsuarioService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("auth")
@AllArgsConstructor
public class AuthenticationController {

    private AuthenticationManager authenticationManager;

    private UsuarioService usuarioService;

    private GrupoRepository grupoRepository;

    private PasswordEncoder passwordEncoder;

    private TokenService tokenService;

    private RegisterService registerService;

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
        String encryptedPassword = passwordEncoder.encode(registerRequestDTO.password());

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

    @PostMapping("/register/complete")
    public ResponseEntity<LoginResponseDTO> registrarCompleto(
            @RequestBody @Valid CompleteRegisterRequestDTO dto) {
        LoginResponseDTO response = registerService.registrarCompleto(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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
