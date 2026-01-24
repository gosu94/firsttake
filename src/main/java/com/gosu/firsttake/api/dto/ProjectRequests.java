package com.gosu.firsttake.api.dto;

public final class ProjectRequests {
    private ProjectRequests() {
    }

    public record ProjectCreate(
        String name,
        String generalPrompt,
        String tone,
        String narratorVoice,
        String narratorVoicePrompt,
        String visualStylePrompt
    ) {
    }

    public record ProjectUpdate(
        String name,
        String generalPrompt,
        String tone,
        String narratorVoice,
        String narratorVoicePrompt,
        String visualStylePrompt
    ) {
    }

    public record BeatCreate(
        Integer orderIndex,
        String scriptSentence,
        String scenePrompt,
        String sceneType,
        Boolean selectedForGeneration,
        Boolean videoGenerateAudio,
        String videoModel
    ) {
    }

    public record BeatUpdate(
        Integer orderIndex,
        String scriptSentence,
        String scenePrompt,
        String sceneType,
        Boolean selectedForGeneration,
        Boolean videoGenerateAudio,
        String videoModel
    ) {
    }

    public record GenerateScript(
        String generalPrompt,
        String tone,
        String narratorVoice,
        String narratorVoicePrompt,
        String visualStylePrompt,
        Integer beatCount,
        Integer durationSeconds
    ) {
    }

    public record GenerateAssets(
        String aspectRatio,
        Boolean generateNarration
    ) {
    }
}
