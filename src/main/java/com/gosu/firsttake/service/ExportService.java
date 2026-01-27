package com.gosu.firsttake.service;

import com.gosu.firsttake.domain.AppUser;
import com.gosu.firsttake.domain.AssetType;
import com.gosu.firsttake.domain.GeneratedAsset;
import com.gosu.firsttake.domain.Project;
import com.gosu.firsttake.domain.TimelineBeat;
import com.gosu.firsttake.repository.GeneratedAssetRepository;
import com.gosu.firsttake.repository.ProjectRepository;
import com.gosu.firsttake.repository.TimelineBeatRepository;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class ExportService {
    private final DefaultUserService defaultUserService;
    private final CurrentUserService currentUserService;
    private final ProjectRepository projectRepository;
    private final TimelineBeatRepository beatRepository;
    private final GeneratedAssetRepository assetRepository;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public ExportService(
        DefaultUserService defaultUserService,
        CurrentUserService currentUserService,
        ProjectRepository projectRepository,
        TimelineBeatRepository beatRepository,
        GeneratedAssetRepository assetRepository
    ) {
        this.defaultUserService = defaultUserService;
        this.currentUserService = currentUserService;
        this.projectRepository = projectRepository;
        this.beatRepository = beatRepository;
        this.assetRepository = assetRepository;
    }

    @Transactional(readOnly = true)
    public void exportProject(Long projectId, HttpServletResponse response) throws IOException {
        Project project = getProjectForDefaultUser(projectId);
        List<TimelineBeat> beats = beatRepository.findByProjectIdOrderByOrderIndexAsc(projectId);
        List<Long> beatIds = beats.stream().map(TimelineBeat::getId).toList();
        List<GeneratedAsset> assets = beatIds.isEmpty() ? List.of() : assetRepository.findByBeatIdIn(beatIds);
        Map<Long, List<GeneratedAsset>> assetsByBeat = new HashMap<>();
        for (GeneratedAsset asset : assets) {
            assetsByBeat.computeIfAbsent(asset.getBeat().getId(), key -> new ArrayList<>()).add(asset);
        }
        for (List<GeneratedAsset> assetList : assetsByBeat.values()) {
            assetList.sort(Comparator.comparing(GeneratedAsset::getCreatedAt));
        }

        response.setContentType("application/zip");
        response.setHeader("Content-Disposition", "attachment; filename=\"project-" + projectId + ".zip\"");

        try (ZipOutputStream zipOutputStream = new ZipOutputStream(response.getOutputStream())) {
            for (TimelineBeat beat : beats) {
                List<GeneratedAsset> beatAssets = assetsByBeat.getOrDefault(beat.getId(), List.of());
                for (GeneratedAsset asset : beatAssets) {
                    writeAsset(zipOutputStream, beat, asset);
                }
            }
            zipOutputStream.finish();
        }
    }

    private void writeAsset(ZipOutputStream zipOutputStream, TimelineBeat beat, GeneratedAsset asset) throws IOException {
        String filename = buildAssetFilename(beat, asset, true);
        try {
            byte[] data = fetchAssetBytes(asset);
            if (data == null) {
                writeErrorFile(zipOutputStream, beat, asset, "Asset download returned no data.");
                return;
            }
            ZipEntry entry = new ZipEntry(filename);
            zipOutputStream.putNextEntry(entry);
            zipOutputStream.write(data);
            zipOutputStream.closeEntry();
        } catch (Exception ex) {
            log.warn("Failed to fetch asset {} for beat {}", asset.getId(), beat.getId(), ex);
            writeErrorFile(zipOutputStream, beat, asset, ex.getMessage() == null ? "Download failed." : ex.getMessage());
        }
    }

    private void writeErrorFile(ZipOutputStream zipOutputStream, TimelineBeat beat, GeneratedAsset asset, String message) throws IOException {
        String filename = "beat-" + beat.getOrderIndex() + "-asset-" + asset.getId() + "-error.txt";
        ZipEntry entry = new ZipEntry(filename);
        zipOutputStream.putNextEntry(entry);
        String payload = "Failed to download asset " + asset.getId() + ": " + message;
        zipOutputStream.write(payload.getBytes(StandardCharsets.UTF_8));
        zipOutputStream.closeEntry();
    }

    private byte[] fetchAssetBytes(GeneratedAsset asset) throws IOException, InterruptedException {
        String url = asset.getUrl();
        if (url == null || url.isBlank()) {
            return null;
        }
        if (url.startsWith("data:")) {
            return decodeDataUrl(url).orElse(null);
        }
        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
            .GET()
            .build();
        HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            return response.body();
        }
        throw new IOException("Remote asset download failed with status " + response.statusCode());
    }

    private Optional<byte[]> decodeDataUrl(String url) {
        int comma = url.indexOf(',');
        if (comma < 0) {
            return Optional.empty();
        }
        String metadata = url.substring(5, comma);
        String data = url.substring(comma + 1);
        if (!metadata.contains("base64")) {
            return Optional.empty();
        }
        return Optional.of(Base64.getDecoder().decode(data));
    }

    private String buildAssetFilename(TimelineBeat beat, GeneratedAsset asset, boolean includeExtension) {
        String stem = switch (asset.getAssetType()) {
            case AUDIO -> "narration";
            case IMAGE, VIDEO -> "scene";
        };
        String extension = includeExtension ? resolveExtension(asset) : "";
        return "beat-" + beat.getOrderIndex() + "-" + stem + "-" + asset.getId() + extension;
    }

    private String resolveExtension(GeneratedAsset asset) {
        String mimeType = asset.getMimeType();
        if (mimeType != null && !mimeType.isBlank()) {
            return "." + extensionFromMime(mimeType);
        }
        String url = asset.getUrl();
        if (url != null) {
            int queryIndex = url.indexOf('?');
            String clean = queryIndex > 0 ? url.substring(0, queryIndex) : url;
            int dot = clean.lastIndexOf('.');
            if (dot > 0 && dot < clean.length() - 1) {
                return "." + clean.substring(dot + 1);
            }
        }
        return asset.getAssetType() == AssetType.AUDIO ? ".mp3" : "";
    }

    private String extensionFromMime(String mimeType) {
        String normalized = mimeType.toLowerCase(Locale.US);
        return switch (normalized) {
            case "audio/mpeg" -> "mp3";
            case "audio/wav" -> "wav";
            case "audio/aac" -> "aac";
            case "audio/ogg" -> "ogg";
            case "image/png" -> "png";
            case "image/jpeg" -> "jpg";
            case "video/mp4" -> "mp4";
            default -> "bin";
        };
    }

    private Project getProjectForDefaultUser(Long projectId) {
        AppUser user = resolveCurrentUser();
        return projectRepository.findByIdAndUserId(projectId, user.getId())
            .orElseThrow(() -> new IllegalArgumentException("Project not found."));
    }

    private AppUser resolveCurrentUser() {
        return currentUserService.getCurrentUser().orElseGet(defaultUserService::getOrCreateDefaultUser);
    }
}
