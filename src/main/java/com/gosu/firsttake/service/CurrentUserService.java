package com.gosu.firsttake.service;

import com.gosu.firsttake.domain.AppUser;
import com.gosu.firsttake.repository.AppUserRepository;
import com.gosu.firsttake.security.AppUserDetails;
import java.util.Optional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {
    private final AppUserRepository appUserRepository;

    public CurrentUserService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    public Optional<AppUser> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof AppUserDetails details) {
            return appUserRepository.findById(details.getId());
        }
        if (principal instanceof OAuth2User oauth2User) {
            Object idValue = oauth2User.getAttribute("appUserId");
            if (idValue instanceof Number number) {
                return appUserRepository.findById(number.longValue());
            }
        }
        return Optional.empty();
    }

    public AppUser requireCurrentUser() {
        return getCurrentUser().orElseThrow(() -> new IllegalStateException("No authenticated user."));
    }
}
