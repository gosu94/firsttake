package com.gosu.firsttake.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "firsttake.sendgrid")
public class SendGridProperties {
    private String apiKey;
    private String fromEmail;
    private String verificationTemplate;
    private String resetTemplate;

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getFromEmail() {
        return fromEmail;
    }

    public void setFromEmail(String fromEmail) {
        this.fromEmail = fromEmail;
    }

    public String getVerificationTemplate() {
        return verificationTemplate;
    }

    public void setVerificationTemplate(String verificationTemplate) {
        this.verificationTemplate = verificationTemplate;
    }

    public String getResetTemplate() {
        return resetTemplate;
    }

    public void setResetTemplate(String resetTemplate) {
        this.resetTemplate = resetTemplate;
    }
}
