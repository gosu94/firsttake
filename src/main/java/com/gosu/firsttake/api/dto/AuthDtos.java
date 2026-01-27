package com.gosu.firsttake.api.dto;

public final class AuthDtos {
    private AuthDtos() {
    }

    public record MessageResponse(String message) {
    }

    public record ModeResponse(String mode) {
    }
}
