package com.gosu.firsttake.ai.tts;

public class TtsResult {
    private final byte[] audio;
    private final String responseFormat;

    public TtsResult(byte[] audio, String responseFormat) {
        this.audio = audio;
        this.responseFormat = responseFormat;
    }

    public byte[] getAudio() {
        return audio;
    }

    public String getResponseFormat() {
        return responseFormat;
    }
}
