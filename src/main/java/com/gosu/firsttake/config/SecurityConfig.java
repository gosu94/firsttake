package com.gosu.firsttake.config;

import com.gosu.firsttake.security.AppOAuth2UserService;
import com.gosu.firsttake.security.AppUserDetailsService;
import com.gosu.firsttake.security.DevDefaultUserFilter;
import com.gosu.firsttake.service.DefaultUserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {
    private final SecurityProperties securityProperties;
    private final DefaultUserService defaultUserService;
    private final AppOAuth2UserService appOAuth2UserService;

    public SecurityConfig(
        SecurityProperties securityProperties,
        DefaultUserService defaultUserService,
        AppOAuth2UserService appOAuth2UserService
    ) {
        this.securityProperties = securityProperties;
        this.defaultUserService = defaultUserService;
        this.appOAuth2UserService = appOAuth2UserService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"));
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED));

        if (securityProperties.getMode() == SecurityMode.DEV_DEFAULT_USER) {
            http.authorizeHttpRequests(authorize -> authorize.anyRequest().permitAll());
            http.addFilterBefore(new DevDefaultUserFilter(defaultUserService), UsernamePasswordAuthenticationFilter.class);
            http.formLogin(form -> form.disable());
            http.httpBasic(basic -> basic.disable());
            return http.build();
        }

        http.authorizeHttpRequests(authorize -> authorize
            .requestMatchers(
                "/",
                "/login",
                "/gallery",
                "/store",
                "/user",
                "/settings",
                "/favicon.ico",
                "/**/*.css",
                "/**/*.js",
                "/**/*.png",
                "/**/*.jpg",
                "/**/*.jpeg",
                "/**/*.svg",
                "/**/*.ico",
                "/**/*.woff2",
                "/api/auth/**",
                "/oauth2/**"
            ).permitAll()
            .requestMatchers("/api/**").authenticated()
            .anyRequest().permitAll()
        );

        http.formLogin(form -> form.disable());
        http.oauth2Login(oauth -> oauth.userInfoEndpoint(userInfo -> userInfo.userService(appOAuth2UserService)));
        http.httpBasic(basic -> basic.disable());
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(
        AppUserDetailsService userDetailsService,
        PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }
}
