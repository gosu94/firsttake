package com.gosu.firsttake.security;

import com.gosu.firsttake.domain.AppUser;
import com.gosu.firsttake.repository.AppUserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AppUserDetailsService implements UserDetailsService {
    private final AppUserRepository appUserRepository;

    public AppUserDetailsService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AppUser user = appUserRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found."));
        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new UsernameNotFoundException("Password login is not configured for this user.");
        }
        return new AppUserDetails(user.getId(), user.getEmail(), user.getPasswordHash(), user.isEmailVerified());
    }
}
