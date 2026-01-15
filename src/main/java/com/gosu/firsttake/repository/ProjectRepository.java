package com.gosu.firsttake.repository;

import com.gosu.firsttake.domain.Project;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUserIdOrderByCreatedAtAsc(Long userId);
    Optional<Project> findByIdAndUserId(Long id, Long userId);
    boolean existsByUserId(Long userId);
}
