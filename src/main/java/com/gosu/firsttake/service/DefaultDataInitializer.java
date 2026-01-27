package com.gosu.firsttake.service;

import com.gosu.firsttake.config.SecurityMode;
import com.gosu.firsttake.config.SecurityProperties;
import com.gosu.firsttake.domain.AppUser;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DefaultDataInitializer implements ApplicationRunner {
    private final DefaultUserService defaultUserService;
    private final SecurityProperties securityProperties;

    public DefaultDataInitializer(DefaultUserService defaultUserService, SecurityProperties securityProperties) {
        this.defaultUserService = defaultUserService;
        this.securityProperties = securityProperties;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (securityProperties.getMode() != SecurityMode.DEV_DEFAULT_USER) {
            return;
        }
        AppUser user = defaultUserService.getOrCreateDefaultUser();
        defaultUserService.ensureDefaultProject(user);
    }
}
