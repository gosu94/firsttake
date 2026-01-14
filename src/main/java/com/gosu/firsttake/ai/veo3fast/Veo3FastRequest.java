package com.gosu.firsttake.ai.veo3fast;

public class Veo3FastRequest {
    private String prompt;
    private String aspectRatio = "16:9";
    private String duration = "8s";
    private String resolution = "720p";
    private Boolean generateAudio = Boolean.TRUE;
    private Boolean autoFix = Boolean.TRUE;
    private String negativePrompt;
    private Integer seed;

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getAspectRatio() {
        return aspectRatio;
    }

    public void setAspectRatio(String aspectRatio) {
        this.aspectRatio = aspectRatio;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getResolution() {
        return resolution;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }

    public Boolean getGenerateAudio() {
        return generateAudio;
    }

    public void setGenerateAudio(Boolean generateAudio) {
        this.generateAudio = generateAudio;
    }

    public Boolean getAutoFix() {
        return autoFix;
    }

    public void setAutoFix(Boolean autoFix) {
        this.autoFix = autoFix;
    }

    public String getNegativePrompt() {
        return negativePrompt;
    }

    public void setNegativePrompt(String negativePrompt) {
        this.negativePrompt = negativePrompt;
    }

    public Integer getSeed() {
        return seed;
    }

    public void setSeed(Integer seed) {
        this.seed = seed;
    }
}
