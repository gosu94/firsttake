package com.gosu.firsttake.service;

import com.gosu.firsttake.domain.AppUser;
import com.gosu.firsttake.domain.EmailVerificationToken;
import com.gosu.firsttake.domain.PasswordResetToken;
import com.gosu.firsttake.repository.AppUserRepository;
import com.gosu.firsttake.repository.EmailVerificationTokenRepository;
import com.gosu.firsttake.repository.PasswordResetTokenRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private static final Duration VERIFICATION_TTL = Duration.ofHours(24);
    private static final Duration RESET_TTL = Duration.ofHours(1);

    private final AppUserRepository appUserRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthService(
        AppUserRepository appUserRepository,
        EmailVerificationTokenRepository emailVerificationTokenRepository,
        PasswordResetTokenRepository passwordResetTokenRepository,
        PasswordEncoder passwordEncoder,
        EmailService emailService
    ) {
        this.appUserRepository = appUserRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public AppUser register(String email, String password, String baseUrl) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password is required.");
        }
        Optional<AppUser> existing = appUserRepository.findByEmail(email);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Email already registered.");
        }
        AppUser user = new AppUser();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setEmailVerified(false);
        if (email != null && email.contains("@")) {
            user.setDisplayName(email.substring(0, email.indexOf('@')));
        }
        appUserRepository.save(user);

        EmailVerificationToken token = new EmailVerificationToken();
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiresAt(Instant.now().plus(VERIFICATION_TTL));
        emailVerificationTokenRepository.save(token);

        String link = baseUrl + "/api/auth/verify-email?token=" + token.getToken();
        emailService.sendVerificationEmail(email, link);
        return user;
    }

    @Transactional
    public void verifyEmail(String tokenValue) {
        EmailVerificationToken token = emailVerificationTokenRepository.findByToken(tokenValue)
            .orElseThrow(() -> new IllegalArgumentException("Invalid verification token."));
        if (token.getUsedAt() != null) {
            throw new IllegalArgumentException("Token already used.");
        }
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Token expired.");
        }
        AppUser user = token.getUser();
        user.setEmailVerified(true);
        appUserRepository.save(user);
        token.setUsedAt(Instant.now());
        emailVerificationTokenRepository.save(token);
    }

    @Transactional
    public void requestPasswordReset(String email, String baseUrl) {
        if (email == null || email.isBlank()) {
            return;
        }
        AppUser user = appUserRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return;
        }
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiresAt(Instant.now().plus(RESET_TTL));
        passwordResetTokenRepository.save(token);

        String link = baseUrl + "/reset-password?token=" + token.getToken();
        emailService.sendPasswordResetEmail(email, link);
    }

    @Transactional
    public void resetPassword(String tokenValue, String newPassword) {
        if (tokenValue == null || tokenValue.isBlank()) {
            throw new IllegalArgumentException("Token is required.");
        }
        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("Password is required.");
        }
        PasswordResetToken token = passwordResetTokenRepository.findByToken(tokenValue)
            .orElseThrow(() -> new IllegalArgumentException("Invalid reset token."));
        if (token.getUsedAt() != null) {
            throw new IllegalArgumentException("Token already used.");
        }
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Token expired.");
        }
        AppUser user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        appUserRepository.save(user);
        token.setUsedAt(Instant.now());
        passwordResetTokenRepository.save(token);
    }
}
