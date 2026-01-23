package com.gosu.firsttake.ai.sora;

public class SoraRequest {
    private String prompt;
    private String resolution = "720p";
    private String aspectRatio = "16:9";
    private Integer duration = 4;
    private Boolean deleteVideo = Boolean.TRUE;
    private String model = "sora-2";

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getResolution() {
        return resolution;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }

    public String getAspectRatio() {
        return aspectRatio;
    }

    public void setAspectRatio(String aspectRatio) {
        this.aspectRatio = aspectRatio;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public Boolean getDeleteVideo() {
        return deleteVideo;
    }

    public void setDeleteVideo(Boolean deleteVideo) {
        this.deleteVideo = deleteVideo;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }
}
