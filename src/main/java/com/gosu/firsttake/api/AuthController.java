package com.gosu.firsttake.api;

import com.gosu.firsttake.api.dto.AuthDtos;
import com.gosu.firsttake.api.dto.AuthRequests;
import com.gosu.firsttake.api.dto.UserDtos;
import com.gosu.firsttake.config.SecurityMode;
import com.gosu.firsttake.config.SecurityProperties;
import com.gosu.firsttake.domain.AppUser;
import com.gosu.firsttake.repository.AppUserRepository;
import com.gosu.firsttake.service.AuthService;
import com.gosu.firsttake.service.CurrentUserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final SecurityProperties securityProperties;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final CurrentUserService currentUserService;
    private final AppUserRepository appUserRepository;

    public AuthController(
        AuthService authService,
        SecurityProperties securityProperties,
        AuthenticationManager authenticationManager,
        SecurityContextRepository securityContextRepository,
        CurrentUserService currentUserService,
        AppUserRepository appUserRepository
    ) {
        this.authService = authService;
        this.securityProperties = securityProperties;
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
        this.currentUserService = currentUserService;
        this.appUserRepository = appUserRepository;
    }

    @GetMapping("/mode")
    public AuthDtos.ModeResponse getMode() {
        return new AuthDtos.ModeResponse(securityProperties.getMode().name());
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthDtos.MessageResponse register(
        @RequestBody AuthRequests.RegisterRequest request,
        HttpServletRequest httpRequest
    ) {
        String baseUrl = resolveBaseUrl(httpRequest);
        authService.register(request.email(), request.password(), baseUrl);
        return new AuthDtos.MessageResponse("Registration complete. Check your email for verification.");
    }

    @PostMapping("/login")
    public UserDtos.MeResponse login(
        @RequestBody AuthRequests.LoginRequest request,
        HttpServletRequest httpRequest,
        HttpServletResponse httpResponse
    ) {
        if (securityProperties.getMode() == SecurityMode.DEV_DEFAULT_USER) {
            return currentUserService.getCurrentUser()
                .map(user -> new UserDtos.MeResponse(
                    user.getId(),
                    user.getEmail(),
                    user.isEmailVerified(),
                    user.getDisplayName(),
                    user.getCoinBalance(),
                    user.getCreatedAt(),
                    user.getLastLoginAt(),
                    securityProperties.getMode().name()
                ))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No dev user."));
        }
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            securityContextRepository.saveContext(context, httpRequest, httpResponse);
            AppUser user = appUserRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
            user.setLastLoginAt(java.time.Instant.now());
            appUserRepository.save(user);
            return new UserDtos.MeResponse(
                user.getId(),
                user.getEmail(),
                user.isEmailVerified(),
                user.getDisplayName(),
                user.getCoinBalance(),
                user.getCreatedAt(),
                user.getLastLoginAt(),
                securityProperties.getMode().name()
            );
        } catch (DisabledException ex) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Email not verified.");
        } catch (BadCredentialsException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials.");
        }
    }

    @PostMapping("/logout")
    public AuthDtos.MessageResponse logout(HttpServletRequest request, HttpServletResponse response) {
        new SecurityContextLogoutHandler().logout(request, response, SecurityContextHolder.getContext().getAuthentication());
        return new AuthDtos.MessageResponse("Logged out.");
    }

    @PostMapping("/forgot-password")
    public AuthDtos.MessageResponse forgotPassword(
        @RequestBody AuthRequests.ForgotPasswordRequest request,
        HttpServletRequest httpRequest
    ) {
        String baseUrl = resolveBaseUrl(httpRequest);
        authService.requestPasswordReset(request.email(), baseUrl);
        return new AuthDtos.MessageResponse("If the account exists, a reset email has been sent.");
    }

    @PostMapping("/reset-password")
    public AuthDtos.MessageResponse resetPassword(@RequestBody AuthRequests.ResetPasswordRequest request) {
        authService.resetPassword(request.token(), request.newPassword());
        return new AuthDtos.MessageResponse("Password reset.");
    }

    @GetMapping("/verify-email")
    public AuthDtos.MessageResponse verifyEmail(@RequestParam("token") String token) {
        authService.verifyEmail(token);
        return new AuthDtos.MessageResponse("Email verified.");
    }

    private String resolveBaseUrl(HttpServletRequest request) {
        String scheme = request.getScheme();
        String host = request.getServerName();
        int port = request.getServerPort();
        boolean standardPort = ("http".equalsIgnoreCase(scheme) && port == 80)
            || ("https".equalsIgnoreCase(scheme) && port == 443);
        return standardPort ? scheme + "://" + host : scheme + "://" + host + ":" + port;
    }
}
