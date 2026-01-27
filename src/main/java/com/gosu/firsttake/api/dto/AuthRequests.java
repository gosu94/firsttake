package com.gosu.firsttake.api.dto;

public final class AuthRequests {
    private AuthRequests() {
    }

    public record RegisterRequest(String email, String password) {
    }

    public record LoginRequest(String email, String password) {
    }

    public record ForgotPasswordRequest(String email) {
    }

    public record ResetPasswordRequest(String token, String newPassword) {
    }
}
