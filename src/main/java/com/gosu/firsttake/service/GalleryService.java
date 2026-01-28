package com.gosu.firsttake.service;

import com.gosu.firsttake.api.dto.GalleryDtos;
import com.gosu.firsttake.domain.AppUser;
import com.gosu.firsttake.domain.AssetType;
import com.gosu.firsttake.domain.GeneratedAsset;
import com.gosu.firsttake.domain.Project;
import com.gosu.firsttake.repository.GeneratedAssetRepository;
import com.gosu.firsttake.repository.ProjectRepository;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GalleryService {
    private final DefaultUserService defaultUserService;
    private final CurrentUserService currentUserService;
    private final ProjectRepository projectRepository;
    private final GeneratedAssetRepository generatedAssetRepository;

    public GalleryService(
        DefaultUserService defaultUserService,
        CurrentUserService currentUserService,
        ProjectRepository projectRepository,
        GeneratedAssetRepository generatedAssetRepository
    ) {
        this.defaultUserService = defaultUserService;
        this.currentUserService = currentUserService;
        this.projectRepository = projectRepository;
        this.generatedAssetRepository = generatedAssetRepository;
    }

    @Transactional(readOnly = true)
    public List<GalleryDtos.GalleryProject> listProjects() {
        AppUser user = resolveCurrentUser();
        List<Project> projects = projectRepository.findByUserIdOrderByUpdatedAtDesc(user.getId());
        if (projects.isEmpty()) {
            return List.of();
        }
        Collection<Long> projectIds = projects.stream().map(Project::getId).toList();
        Map<Long, Long> assetCounts = new HashMap<>();
        for (Object[] row : generatedAssetRepository.countByProjectIds(projectIds)) {
            if (row[0] instanceof Long projectId && row[1] instanceof Long count) {
                assetCounts.put(projectId, count);
            }
        }
        List<GalleryDtos.GalleryProject> results = new ArrayList<>();
        for (Project project : projects) {
            Optional<GeneratedAsset> preview = generatedAssetRepository
                .findTop1ByProjectIdAndAssetTypeOrderByCreatedAtDesc(project.getId(), AssetType.IMAGE)
                .or(() -> generatedAssetRepository
                    .findTop1ByProjectIdAndAssetTypeOrderByCreatedAtDesc(project.getId(), AssetType.VIDEO));
            String previewUrl = preview.map(GeneratedAsset::getUrl).orElse(null);
            String previewAssetType = preview.map(asset -> asset.getAssetType().name()).orElse(null);
            results.add(new GalleryDtos.GalleryProject(
                project.getId(),
                project.getName(),
                project.getStatus().name(),
                project.getCreatedAt(),
                project.getUpdatedAt(),
                assetCounts.getOrDefault(project.getId(), 0L),
                previewUrl,
                previewAssetType
            ));
        }
        return results;
    }

    @Transactional(readOnly = true)
    public List<GalleryDtos.GalleryAsset> listProjectAssets(
        Long projectId,
        Optional<String> type,
        Optional<String> sort
    ) {
        Project project = getProjectForCurrentUser(projectId);
        List<GeneratedAsset> assets;
        if (type.isPresent() && !type.get().isBlank()) {
            AssetType assetType = AssetType.valueOf(type.get().trim().toUpperCase(Locale.US));
            assets = generatedAssetRepository.findByProjectIdAndAssetTypeOrderByCreatedAtDesc(project.getId(), assetType);
        } else {
            assets = generatedAssetRepository.findByProjectIdOrderByCreatedAtDesc(project.getId());
        }
        if (sort.isPresent() && "asc".equalsIgnoreCase(sort.get())) {
            assets = assets.stream().sorted(Comparator.comparing(GeneratedAsset::getCreatedAt)).toList();
        }
        return assets.stream()
            .map(asset -> new GalleryDtos.GalleryAsset(
                asset.getId(),
                asset.getProject() != null ? asset.getProject().getId() : null,
                asset.getBeat() != null ? asset.getBeat().getId() : null,
                asset.getBeat() != null ? asset.getBeat().getOrderIndex() : null,
                asset.getAssetType().name(),
                asset.getUrl(),
                asset.getProvider(),
                asset.getMimeType(),
                asset.getDurationSeconds(),
                asset.getOriginalPrompt(),
                asset.getCreatedAt()
            ))
            .toList();
    }

    @Transactional
    public void deleteAsset(Long assetId) {
        AppUser user = resolveCurrentUser();
        GeneratedAsset asset = generatedAssetRepository.findByIdAndProjectUserId(assetId, user.getId())
            .orElseThrow(() -> new IllegalArgumentException("Asset not found."));
        generatedAssetRepository.delete(asset);
    }

    private Project getProjectForCurrentUser(Long projectId) {
        AppUser user = resolveCurrentUser();
        return projectRepository.findByIdAndUserId(projectId, user.getId())
            .orElseThrow(() -> new IllegalArgumentException("Project not found."));
    }

    private AppUser resolveCurrentUser() {
        return currentUserService.getCurrentUser().orElseGet(defaultUserService::getOrCreateDefaultUser);
    }
}
