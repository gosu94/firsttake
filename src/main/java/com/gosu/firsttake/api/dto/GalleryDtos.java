package com.gosu.firsttake.api.dto;

import java.time.Instant;

public final class GalleryDtos {
    private GalleryDtos() {
    }

    public record GalleryProject(
        Long id,
        String name,
        String status,
        Instant createdAt,
        Instant updatedAt,
        long assetCount,
        String previewUrl,
        String previewAssetType
    ) {
    }

    public record GalleryAsset(
        Long id,
        Long projectId,
        Long beatId,
        Integer beatOrderIndex,
        String assetType,
        String url,
        String provider,
        String mimeType,
        Double durationSeconds,
        String originalPrompt,
        Instant createdAt
    ) {
    }
}
