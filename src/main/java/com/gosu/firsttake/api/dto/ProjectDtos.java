package com.gosu.firsttake.api.dto;

import java.time.Instant;
import java.util.List;

public final class ProjectDtos {
    private ProjectDtos() {
    }

    public record ProjectSummary(
        Long id,
        String name,
        String generalPrompt,
        String tone,
        String narratorVoice,
        String narratorVoicePrompt,
        Instant createdAt,
        Instant updatedAt
    ) {
    }

    public record ProjectDetail(
        Long id,
        String name,
        String generalPrompt,
        String tone,
        String narratorVoice,
        String narratorVoicePrompt,
        Instant createdAt,
        Instant updatedAt,
        List<BeatDetail> beats
    ) {
    }

    public record BeatDetail(
        Long id,
        int orderIndex,
        String scriptSentence,
        String scenePrompt,
        String sceneType,
        boolean selectedForGeneration,
        Instant createdAt,
        Instant updatedAt,
        List<AssetDetail> assets
    ) {
    }

    public record AssetDetail(
        Long id,
        String assetType,
        String url,
        String provider,
        String mimeType,
        Double durationSeconds,
        Instant createdAt
    ) {
    }
}
