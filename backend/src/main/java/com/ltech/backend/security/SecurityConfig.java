package com.ltech.backend.security;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Value("${cors.origins:http://localhost:3000}")
    private String corsOrigins;

    @Value("${security.hsts.enabled:false}")
    private boolean hstsEnabled;

    private final SecurityFilter securityFilter;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;

    public SecurityConfig(SecurityFilter securityFilter,
                          CustomAuthenticationEntryPoint authenticationEntryPoint,
                          CustomAccessDeniedHandler accessDeniedHandler) {
        this.securityFilter = securityFilter;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .headers(headers -> {
                    headers.frameOptions(frame -> frame.deny());
                    headers.contentTypeOptions(contentType -> {});
                    headers.referrerPolicy(referrer -> referrer
                            .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN));
                    headers.permissionsPolicy(permissions -> permissions
                            .policy("camera=(), microphone=(), geolocation=()"));
                    if (hstsEnabled) {
                        headers.httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(31536000));
                    } else {
                        headers.httpStrictTransportSecurity(hsts -> hsts.disable());
                    }
                })
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/motos/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/motos", "/api/motos/**").hasRole("ADMIN_FULL")
                        .requestMatchers(HttpMethod.PUT, "/api/motos/**").hasRole("ADMIN_FULL")
                        .requestMatchers(HttpMethod.DELETE, "/api/motos/**").hasRole("ADMIN_FULL")
                        .requestMatchers(HttpMethod.GET, "/api/categorias/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/categorias", "/api/categorias/**").hasRole("ADMIN_FULL")
                        .requestMatchers(HttpMethod.PUT, "/api/categorias/**").hasRole("ADMIN_FULL")
                        .requestMatchers(HttpMethod.DELETE, "/api/categorias/**").hasRole("ADMIN_FULL")
                        .requestMatchers(HttpMethod.GET, "/api/acessorios/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/acessorios", "/api/acessorios/**").hasRole("ADMIN_FULL")
                        .requestMatchers(HttpMethod.PUT, "/api/acessorios/**").hasRole("ADMIN_FULL")
                        .requestMatchers(HttpMethod.DELETE, "/api/acessorios/**").hasRole("ADMIN_FULL")
                        .requestMatchers(HttpMethod.GET, "/api/seguros/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/seguros", "/api/seguros/**").hasRole("ADMIN_FULL")
                        .requestMatchers(HttpMethod.PUT, "/api/seguros/**").hasRole("ADMIN_FULL")
                        .requestMatchers(HttpMethod.DELETE, "/api/seguros/**").hasRole("ADMIN_FULL")
                        .requestMatchers(HttpMethod.GET, "/api/lavagens/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/lavagens", "/api/lavagens/**").hasRole("ADMIN_FULL")
                        .requestMatchers(HttpMethod.PUT, "/api/lavagens/**").hasRole("ADMIN_FULL")
                        .requestMatchers(HttpMethod.DELETE, "/api/lavagens/**").hasRole("ADMIN_FULL")
                        .requestMatchers(HttpMethod.GET, "/api/locais/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/uploads/**").hasRole("ADMIN_FULL")
                        .requestMatchers(HttpMethod.DELETE, "/api/uploads/**").hasRole("ADMIN_FULL")
                        .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/register/cliente").permitAll()
                        .requestMatchers(HttpMethod.GET, "/auth/check-email", "/auth/check-cpf").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/register").hasAnyRole("ADMINS", "DESENVOLVEDORES")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN_FULL")
                        .requestMatchers("/api/reservas/**").authenticated()
                        .requestMatchers("/api/usuarios/**").authenticated()
                        .requestMatchers("/api/cartoes/**").authenticated()
                        .requestMatchers("/api/enderecos-cobranca/**").authenticated()
                        .requestMatchers("/api/cnh/**").authenticated()
                        .anyRequest().authenticated())
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(corsOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
