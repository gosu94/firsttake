package com.gosu.firsttake.repository;

import com.gosu.firsttake.domain.UserAuthProvider;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAuthProviderRepository extends JpaRepository<UserAuthProvider, Long> {
    Optional<UserAuthProvider> findByProviderAndProviderSubject(String provider, String providerSubject);
}
