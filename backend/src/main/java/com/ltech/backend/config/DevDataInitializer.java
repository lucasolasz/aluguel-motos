package com.ltech.backend.config;

import com.ltech.backend.domain.entities.Grupo;
import com.ltech.backend.domain.entities.Usuario;
import com.ltech.backend.domain.repositories.GrupoRepository;
import com.ltech.backend.domain.repositories.UsuarioRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Profile("dev")
@AllArgsConstructor
public class DevDataInitializer implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final GrupoRepository grupoRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        seedUser("lucas@admin.com", "lucas123", "DESENVOLVEDORES", "Lucas Andrade", "84596566089", "(11) 99999-9999");
        seedUser("danilo@admin.com", "admin123", "ADMINS", "Danilo", "12345678909", "(11) 98888-8888");
    }

    private void seedUser(String username, String rawPassword, String grupoNome,
                          String nomeCompleto, String cpf, String telefone) {
        if (usuarioRepository.findByUsername(username).isPresent()) {
            log.debug("[DevDataInitializer] {} already exists, skipping", username);
            return;
        }
        Grupo grupo = grupoRepository.findByNome(grupoNome)
                .orElseThrow(() -> new IllegalStateException("Grupo " + grupoNome + " not found"));
        usuarioRepository.save(new Usuario(
                username, passwordEncoder.encode(rawPassword), true, grupo, nomeCompleto, telefone, cpf));
        log.info("[DevDataInitializer] Seeded: {}", username);
    }
}
