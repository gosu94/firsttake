package com.gosu.firsttake.api;

import com.gosu.firsttake.api.dto.GalleryDtos;
import com.gosu.firsttake.service.GalleryService;
import java.util.List;
import java.util.Optional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/gallery")
public class GalleryController {
    private final GalleryService galleryService;

    public GalleryController(GalleryService galleryService) {
        this.galleryService = galleryService;
    }

    @GetMapping("/projects")
    public List<GalleryDtos.GalleryProject> listProjects() {
        return galleryService.listProjects();
    }

    @GetMapping("/projects/{projectId}/assets")
    public List<GalleryDtos.GalleryAsset> listProjectAssets(
        @PathVariable Long projectId,
        @RequestParam(name = "type", required = false) Optional<String> type,
        @RequestParam(name = "sort", required = false) Optional<String> sort
    ) {
        return galleryService.listProjectAssets(projectId, type, sort);
    }

    @DeleteMapping("/assets/{assetId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAsset(@PathVariable Long assetId) {
        galleryService.deleteAsset(assetId);
    }
}
