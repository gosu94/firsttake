package com.gosu.firsttake.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "firsttake.security")
public class SecurityProperties {
    private SecurityMode mode = SecurityMode.DEV_DEFAULT_USER;

    public SecurityMode getMode() {
        return mode;
    }

    public void setMode(SecurityMode mode) {
        this.mode = mode;
    }
}
