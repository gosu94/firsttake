package com.gosu.firsttake.security;

import com.gosu.firsttake.domain.AppUser;
import com.gosu.firsttake.domain.UserAuthProvider;
import com.gosu.firsttake.repository.AppUserRepository;
import com.gosu.firsttake.repository.UserAuthProviderRepository;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class AppOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    private final UserAuthProviderRepository providerRepository;
    private final AppUserRepository appUserRepository;
    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();

    public AppOAuth2UserService(
        UserAuthProviderRepository providerRepository,
        AppUserRepository appUserRepository
    ) {
        this.providerRepository = providerRepository;
        this.appUserRepository = appUserRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauthUser = delegate.loadUser(userRequest);
        String provider = userRequest.getClientRegistration().getRegistrationId();
        String subject = oauthUser.getAttribute("sub");
        String email = oauthUser.getAttribute("email");
        if (subject == null) {
            throw new OAuth2AuthenticationException("Missing subject from OAuth2 provider");
        }

        UserAuthProvider link = providerRepository.findByProviderAndProviderSubject(provider, subject)
            .orElseGet(() -> createLink(provider, subject, email));
        AppUser user = link.getUser();
        if (user.getLastLoginAt() == null || user.getLastLoginAt().isBefore(Instant.now().minusSeconds(5))) {
            user.setLastLoginAt(Instant.now());
            appUserRepository.save(user);
        }

        Map<String, Object> attributes = new HashMap<>(oauthUser.getAttributes());
        attributes.put("appUserId", user.getId());
        return new DefaultOAuth2User(oauthUser.getAuthorities(), attributes, "sub");
    }

    private UserAuthProvider createLink(String provider, String subject, String email) {
        AppUser user = new AppUser();
        user.setEmail(email);
        user.setEmailVerified(true);
        if (email != null && email.contains("@")) {
            user.setDisplayName(email.substring(0, email.indexOf('@')));
        }
        appUserRepository.save(user);

        UserAuthProvider link = new UserAuthProvider();
        link.setUser(user);
        link.setProvider(provider);
        link.setProviderSubject(subject);
        link.setProviderEmail(email);
        return providerRepository.save(link);
    }
}
