package com.gosu.firsttake.service;

import com.gosu.firsttake.domain.AppUser;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DefaultDataInitializer implements ApplicationRunner {
    private final DefaultUserService defaultUserService;

    public DefaultDataInitializer(DefaultUserService defaultUserService) {
        this.defaultUserService = defaultUserService;
    }

    @Override
    public void run(ApplicationArguments args) {
        AppUser user = defaultUserService.getOrCreateDefaultUser();
        defaultUserService.ensureDefaultProject(user);
    }
}
