package com.gosu.firsttake.repository;

import com.gosu.firsttake.domain.AppUser;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findFirstByEmail(String email);
    Optional<AppUser> findByEmail(String email);
}
