package com.gosu.firsttake.ai.tts;

import java.util.Arrays;
import java.util.Locale;
import java.util.Optional;

public enum TtsVoice {
    ALLOY("alloy", "Alloy"),
    ASH("ash", "Ash"),
    BALLAD("ballad", "Ballad"),
    CEDAR("cedar", "Cedar"),
    CORAL("coral", "Coral"),
    ECHO("echo", "Echo"),
    FABLE("fable", "Fable"),
    MARIN("marin", "Marin"),
    NOVA("nova", "Nova"),
    ONYX("onyx", "Onyx"),
    SAGE("sage", "Sage"),
    SHIMMER("shimmer", "Shimmer"),
    VERSE("verse", "Verse");

    private final String id;
    private final String label;

    TtsVoice(String id, String label) {
        this.id = id;
        this.label = label;
    }

    public String id() {
        return id;
    }

    public String label() {
        return label;
    }

    public static Optional<TtsVoice> fromId(String value) {
        if (value == null || value.isBlank()) {
            return Optional.empty();
        }
        String normalized = value.trim().toLowerCase(Locale.US);
        return Arrays.stream(values())
            .filter(voice -> voice.id.equals(normalized))
            .findFirst();
    }
}
