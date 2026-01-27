package com.gosu.firsttake.api.dto;

import java.time.Instant;
import java.util.List;

public final class UserDtos {
    private UserDtos() {
    }

    public record MeResponse(
        Long id,
        String email,
        boolean emailVerified,
        String displayName,
        long coinBalance,
        Instant createdAt,
        Instant lastLoginAt,
        String securityMode
    ) {
    }

    public record CoinBalanceResponse(
        long balance,
        List<CoinTransactionDto> recent
    ) {
    }

    public record CoinTransactionDto(
        Long id,
        String type,
        long amount,
        String reason,
        Long relatedProjectId,
        Long relatedAssetId,
        Instant createdAt
    ) {
    }

    public record GalleryAsset(
        Long id,
        Long projectId,
        Long beatId,
        String assetType,
        String url,
        String provider,
        String mimeType,
        Double durationSeconds,
        String originalPrompt,
        Instant createdAt
    ) {
    }

    public record PurchaseIntentResponse(
        String status,
        String message
    ) {
    }
}
