package com.ltech.backend.security;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.ltech.backend.domain.entities.Usuario;

import lombok.AllArgsConstructor;

/**
 * O projeto foi pensado em
 * ter usuários dentro de grupos e cada grupo tem uma série de permissões.
 * 
 */
@AllArgsConstructor
public class UsuarioDetails implements UserDetails {

    private final Usuario usuario;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        Set<GrantedAuthority> authorities = new HashSet<>();

        this.adicionarTodasPermissoesDoGrupoComoRoles(authorities, usuario);
        this.adicionarNomeDoGrupoComoRole(authorities, usuario);

        return authorities;
    }

    /**
     * Adiciona todas as permissões do grupo do usuário como roles.
     * 
     * @param authorities
     * @param usuario
     */
    private void adicionarTodasPermissoesDoGrupoComoRoles(Set<GrantedAuthority> authorities, Usuario usuario) {
        for (var permissao : usuario.getGrupo().getPermissoes()) {
            String roleName = "ROLE_" + permissao.getNome();
            authorities.add(new SimpleGrantedAuthority(roleName));
        }
        this.adicionarNomeDoGrupoComoRole(authorities, usuario);
    }

    /**
     * Adiciona o nome do grupo do usuário como uma role.
     * 
     * @param authorities
     * @param usuario
     */
    private void adicionarNomeDoGrupoComoRole(Set<GrantedAuthority> authorities, Usuario usuario) {
        String roleName = "ROLE_" + usuario.getGrupo().getNome();
        authorities.add(new SimpleGrantedAuthority(roleName));
    }

    @Override
    public String getPassword() {
        return usuario.getPassword();
    }

    @Override
    public String getUsername() {
        return usuario.getUsername();
    }

    @Override
    public boolean isEnabled() {
        return usuario.isEnabled();
    }

    public Usuario getUsuario() {
        return usuario;
    }
}
