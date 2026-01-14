package com.gosu.firsttake.ai.nanobanana;

public class NanoBananaForm {
    private String prompt;
    private String aspectRatio = "1:1";
    private String outputFormat = "png";
    private Integer numImages = 1;

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

    public String getOutputFormat() {
        return outputFormat;
    }

    public void setOutputFormat(String outputFormat) {
        this.outputFormat = outputFormat;
    }

    public Integer getNumImages() {
        return numImages;
    }

    public void setNumImages(Integer numImages) {
        this.numImages = numImages;
    }
}
