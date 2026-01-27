package com.gosu.firsttake.security;

import com.gosu.firsttake.domain.AppUser;
import com.gosu.firsttake.service.DefaultUserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

public class DevDefaultUserFilter extends OncePerRequestFilter {
    private final DefaultUserService defaultUserService;

    public DevDefaultUserFilter(DefaultUserService defaultUserService) {
        this.defaultUserService = defaultUserService;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            AppUser user = defaultUserService.getOrCreateDefaultUser();
            AppUserDetails principal = new AppUserDetails(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                true
            );
            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        filterChain.doFilter(request, response);
    }
}
