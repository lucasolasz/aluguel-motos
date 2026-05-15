package com.ltech.backend.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.ltech.backend.domain.entities.Usuario;
import com.ltech.backend.services.UsuarioService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;

@Component
@AllArgsConstructor
public class SecurityFilter extends OncePerRequestFilter {

    private TokenService tokenService;

    private UsuarioService usuarioService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        var token = this.rerecoverToken(request);
        if (token != null) {

            var username = tokenService.validateToken(token);
            if (username != null && !username.isBlank()) {
                var usuarioOpt = usuarioService.findByUsername(username);
                if (usuarioOpt != null) {
                    Usuario usuario = usuarioOpt;
                    UserDetails userDetails = new UsuarioDetails(usuario);

                    var authentication = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }
        filterChain.doFilter(request, response);

    }

    private String rerecoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null)
            return null;
        return authHeader.replace("Bearer ", "");
    }

}
