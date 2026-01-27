package com.gosu.firsttake.service;

import com.gosu.firsttake.domain.AppUser;
import com.gosu.firsttake.domain.Project;
import com.gosu.firsttake.repository.AppUserRepository;
import com.gosu.firsttake.repository.ProjectRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DefaultUserService {
    public static final String DEFAULT_EMAIL = "default@firsttake.local";

    private final AppUserRepository appUserRepository;
    private final ProjectRepository projectRepository;

    public DefaultUserService(AppUserRepository appUserRepository, ProjectRepository projectRepository) {
        this.appUserRepository = appUserRepository;
        this.projectRepository = projectRepository;
    }

    @Transactional
    public AppUser getOrCreateDefaultUser() {
        Optional<AppUser> existing = appUserRepository.findFirstByEmail(DEFAULT_EMAIL);
        if (existing.isPresent()) {
            return existing.get();
        }
        AppUser user = new AppUser();
        user.setEmail(DEFAULT_EMAIL);
        user.setEmailVerified(true);
        user.setDisplayName("Dev User");
        return appUserRepository.save(user);
    }

    @Transactional
    public Project ensureDefaultProject(AppUser user) {
        if (projectRepository.existsByUserId(user.getId())) {
            return projectRepository.findByUserIdOrderByCreatedAtAsc(user.getId()).getFirst();
        }
        Project project = new Project();
        project.setUser(user);
        project.setName("My FirstTake Project");
        project.setGeneralPrompt("");
        project.setTone("professional");
        project.setNarratorVoice("alloy");
        return projectRepository.save(project);
    }
}
