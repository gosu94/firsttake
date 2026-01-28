package com.gosu.firsttake.service;

import com.gosu.firsttake.domain.AppUser;
import com.gosu.firsttake.domain.AssetType;
import com.gosu.firsttake.domain.GeneratedAsset;
import com.gosu.firsttake.domain.Project;
import com.gosu.firsttake.domain.TimelineBeat;
import com.gosu.firsttake.repository.GeneratedAssetRepository;
import com.gosu.firsttake.repository.ProjectRepository;
import com.gosu.firsttake.repository.TimelineBeatRepository;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
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
        List<GeneratedAsset> assets = assetRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        assets = assets.stream().sorted(Comparator.comparing(GeneratedAsset::getCreatedAt)).toList();
        Map<Long, TimelineBeat> beatMap = beats.stream()
            .collect(Collectors.toMap(TimelineBeat::getId, beat -> beat));

        response.setContentType("application/zip");
        response.setHeader("Content-Disposition", "attachment; filename=\"project-" + projectId + ".zip\"");

        try (ZipOutputStream zipOutputStream = new ZipOutputStream(response.getOutputStream())) {
            JsonArray manifestBeats = new JsonArray();
            for (TimelineBeat beat : beats) {
                JsonObject beatJson = new JsonObject();
                beatJson.addProperty("id", beat.getId());
                beatJson.addProperty("orderIndex", beat.getOrderIndex());
                beatJson.addProperty("scriptSentence", beat.getScriptSentence());
                beatJson.addProperty("scenePrompt", beat.getScenePrompt());
                beatJson.addProperty("sceneType", beat.getSceneType().name());
                manifestBeats.add(beatJson);
            }

            JsonArray manifestAssets = new JsonArray();
            for (GeneratedAsset asset : assets) {
                TimelineBeat beat = asset.getBeat() != null ? beatMap.get(asset.getBeat().getId()) : null;
                String filename = beat != null ? buildAssetFilename(beat, asset, true) : buildOrphanAssetFilename(asset);
                writeAsset(zipOutputStream, beat, asset, filename);

                JsonObject assetJson = new JsonObject();
                assetJson.addProperty("id", asset.getId());
                assetJson.addProperty("assetType", asset.getAssetType().name());
                assetJson.addProperty("beatId", beat != null ? beat.getId() : null);
                assetJson.addProperty("beatOrderIndex", beat != null ? beat.getOrderIndex() : null);
                assetJson.addProperty("url", asset.getUrl());
                assetJson.addProperty("provider", asset.getProvider());
                assetJson.addProperty("mimeType", asset.getMimeType());
                assetJson.addProperty("durationSeconds", asset.getDurationSeconds());
                assetJson.addProperty("originalPrompt", asset.getOriginalPrompt());
                assetJson.addProperty("createdAt", asset.getCreatedAt() != null ? asset.getCreatedAt().toString() : null);
                assetJson.addProperty("filename", filename);
                manifestAssets.add(assetJson);
            }

            JsonObject manifest = new JsonObject();
            manifest.addProperty("projectId", project.getId());
            manifest.addProperty("projectName", project.getName());
            manifest.add("beats", manifestBeats);
            manifest.add("assets", manifestAssets);
            ZipEntry manifestEntry = new ZipEntry("manifest.json");
            zipOutputStream.putNextEntry(manifestEntry);
            zipOutputStream.write(manifest.toString().getBytes(StandardCharsets.UTF_8));
            zipOutputStream.closeEntry();
            zipOutputStream.finish();
        }
    }

    private void writeAsset(
        ZipOutputStream zipOutputStream,
        TimelineBeat beat,
        GeneratedAsset asset,
        String filename
    ) throws IOException {
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
        String filename = beat != null
            ? "beat-" + beat.getOrderIndex() + "-asset-" + asset.getId() + "-error.txt"
            : "unassigned/asset-" + asset.getId() + "-error.txt";
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

    private String buildOrphanAssetFilename(GeneratedAsset asset) {
        String extension = resolveExtension(asset);
        return "unassigned/" + asset.getAssetType().name().toLowerCase(Locale.US) + "-" + asset.getId() + extension;
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
