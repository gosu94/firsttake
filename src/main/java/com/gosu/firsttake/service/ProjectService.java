package com.gosu.firsttake.service;

import com.gosu.firsttake.ai.nanobanana.NanoBananaForm;
import com.gosu.firsttake.ai.nanobanana.NanoBananaResult;
import com.gosu.firsttake.ai.nanobanana.NanoBananaService;
import com.gosu.firsttake.ai.openrouter.OpenRouterRequest;
import com.gosu.firsttake.ai.openrouter.OpenRouterResult;
import com.gosu.firsttake.ai.openrouter.OpenRouterService;
import com.gosu.firsttake.ai.tts.TtsRequest;
import com.gosu.firsttake.ai.tts.TtsResult;
import com.gosu.firsttake.ai.tts.TtsService;
import com.gosu.firsttake.ai.veo3fast.Veo3FastRequest;
import com.gosu.firsttake.ai.veo3fast.Veo3FastResult;
import com.gosu.firsttake.ai.veo3fast.Veo3FastService;
import com.gosu.firsttake.api.dto.ProjectDtos;
import com.gosu.firsttake.api.dto.ProjectRequests;
import com.gosu.firsttake.domain.AppUser;
import com.gosu.firsttake.domain.AssetType;
import com.gosu.firsttake.domain.GeneratedAsset;
import com.gosu.firsttake.domain.Project;
import com.gosu.firsttake.domain.SceneType;
import com.gosu.firsttake.domain.TimelineBeat;
import com.gosu.firsttake.repository.GeneratedAssetRepository;
import com.gosu.firsttake.repository.ProjectRepository;
import com.gosu.firsttake.repository.TimelineBeatRepository;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;

@Slf4j
@Service
public class ProjectService {
    private final DefaultUserService defaultUserService;
    private final ProjectRepository projectRepository;
    private final TimelineBeatRepository beatRepository;
    private final GeneratedAssetRepository assetRepository;
    private final OpenRouterService openRouterService;
    private final TtsService ttsService;
    private final NanoBananaService nanoBananaService;
    private final Veo3FastService veo3FastService;
    private final ExecutorService aiExecutor;

    public ProjectService(
        DefaultUserService defaultUserService,
        ProjectRepository projectRepository,
        TimelineBeatRepository beatRepository,
        GeneratedAssetRepository assetRepository,
        OpenRouterService openRouterService,
        TtsService ttsService,
        NanoBananaService nanoBananaService,
        Veo3FastService veo3FastService,
        ExecutorService aiExecutor
    ) {
        this.defaultUserService = defaultUserService;
        this.projectRepository = projectRepository;
        this.beatRepository = beatRepository;
        this.assetRepository = assetRepository;
        this.openRouterService = openRouterService;
        this.ttsService = ttsService;
        this.nanoBananaService = nanoBananaService;
        this.veo3FastService = veo3FastService;
        this.aiExecutor = aiExecutor;
    }

    @Transactional(readOnly = true)
    public List<ProjectDtos.ProjectSummary> listProjects() {
        AppUser user = defaultUserService.getOrCreateDefaultUser();
        return projectRepository.findByUserIdOrderByCreatedAtAsc(user.getId()).stream()
            .map(this::toSummary)
            .toList();
    }

    @Transactional(readOnly = true)
    public ProjectDtos.ProjectDetail getProjectDetail(Long projectId) {
        Project project = getProjectForDefaultUser(projectId);
        List<TimelineBeat> beats = beatRepository.findByProjectIdOrderByOrderIndexAsc(projectId);
        List<ProjectDtos.BeatDetail> beatDetails = mapBeatsWithAssets(beats);
        return toDetail(project, beatDetails);
    }

    @Transactional
    public ProjectDtos.ProjectSummary createProject(ProjectRequests.ProjectCreate request) {
        AppUser user = defaultUserService.getOrCreateDefaultUser();
        Project project = new Project();
        project.setUser(user);
        project.setName(request.name() == null || request.name().isBlank() ? "Untitled Project" : request.name());
        project.setGeneralPrompt(request.generalPrompt());
        project.setTone(request.tone());
        project.setNarratorVoice(request.narratorVoice());
        project.setNarratorVoicePrompt(request.narratorVoicePrompt());
        project.setVisualStylePrompt(request.visualStylePrompt());
        projectRepository.save(project);
        return toSummary(project);
    }

    @Transactional
    public ProjectDtos.ProjectSummary updateProject(Long projectId, ProjectRequests.ProjectUpdate request) {
        Project project = getProjectForDefaultUser(projectId);
        if (request.name() != null) {
            project.setName(request.name());
        }
        if (request.generalPrompt() != null) {
            project.setGeneralPrompt(request.generalPrompt());
        }
        if (request.tone() != null) {
            project.setTone(request.tone());
        }
        if (request.narratorVoice() != null) {
            project.setNarratorVoice(request.narratorVoice());
        }
        if (request.narratorVoicePrompt() != null) {
            project.setNarratorVoicePrompt(request.narratorVoicePrompt());
        }
        if (request.visualStylePrompt() != null) {
            project.setVisualStylePrompt(request.visualStylePrompt());
        }
        projectRepository.save(project);
        return toSummary(project);
    }

    @Transactional
    public ProjectDtos.BeatDetail createBeat(Long projectId, ProjectRequests.BeatCreate request) {
        Project project = getProjectForDefaultUser(projectId);
        TimelineBeat beat = new TimelineBeat();
        beat.setProject(project);
        int orderIndex = request.orderIndex() != null ? request.orderIndex() : beatRepository.findMaxOrderIndex(projectId) + 1;
        beat.setOrderIndex(orderIndex);
        beat.setScriptSentence(request.scriptSentence());
        beat.setScenePrompt(request.scenePrompt());
        beat.setSceneType(parseSceneType(request.sceneType()));
        if (request.selectedForGeneration() != null) {
            beat.setSelectedForGeneration(request.selectedForGeneration());
        }
        beatRepository.save(beat);
        return toBeatDetail(beat, List.of());
    }

    @Transactional
    public ProjectDtos.BeatDetail updateBeat(Long beatId, ProjectRequests.BeatUpdate request) {
        TimelineBeat beat = beatRepository.findById(beatId)
            .orElseThrow(() -> new IllegalArgumentException("Beat not found."));
        if (request.orderIndex() != null) {
            beat.setOrderIndex(request.orderIndex());
        }
        if (request.scriptSentence() != null) {
            beat.setScriptSentence(request.scriptSentence());
        }
        if (request.scenePrompt() != null) {
            beat.setScenePrompt(request.scenePrompt());
        }
        if (request.sceneType() != null) {
            beat.setSceneType(parseSceneType(request.sceneType()));
        }
        if (request.selectedForGeneration() != null) {
            beat.setSelectedForGeneration(request.selectedForGeneration());
        }
        beatRepository.save(beat);
        List<ProjectDtos.AssetDetail> assets = assetRepository.findByBeatIdIn(List.of(beatId)).stream()
            .sorted(Comparator.comparing(GeneratedAsset::getCreatedAt))
            .map(this::toAssetDetail)
            .toList();
        return toBeatDetail(beat, assets);
    }

    @Transactional
    public void deleteBeat(Long beatId) {
        assetRepository.deleteByBeatId(beatId);
        beatRepository.deleteById(beatId);
    }

    @Transactional
    public List<ProjectDtos.BeatDetail> generateScript(Long projectId, ProjectRequests.GenerateScript request) {
        Project project = getProjectForDefaultUser(projectId);
        if (request.generalPrompt() != null) {
            project.setGeneralPrompt(request.generalPrompt());
        }
        if (request.tone() != null) {
            project.setTone(request.tone());
        }
        if (request.narratorVoice() != null) {
            project.setNarratorVoice(request.narratorVoice());
        }
        if (request.narratorVoicePrompt() != null) {
            project.setNarratorVoicePrompt(request.narratorVoicePrompt());
        }
        if (request.visualStylePrompt() != null) {
            project.setVisualStylePrompt(request.visualStylePrompt());
        }
        projectRepository.save(project);

        String prompt = buildScriptPrompt(project, request.beatCount(), request.durationSeconds());
        OpenRouterRequest openRouterRequest = new OpenRouterRequest();
        openRouterRequest.setPrompt(prompt);
        openRouterRequest.setTemperature(0.7);
        OpenRouterResult result = openRouterService.generate(openRouterRequest);
        List<ScriptBeat> beats = parseScript(result.output());

        List<TimelineBeat> existingBeats = beatRepository.findByProjectIdOrderByOrderIndexAsc(projectId);
        for (TimelineBeat existingBeat : existingBeats) {
            assetRepository.deleteByBeatId(existingBeat.getId());
        }
        beatRepository.deleteByProjectId(projectId);

        List<TimelineBeat> saved = new ArrayList<>();
        int index = 0;
        for (ScriptBeat scriptBeat : beats) {
            TimelineBeat beat = new TimelineBeat();
            beat.setProject(project);
            beat.setOrderIndex(index++);
            beat.setScriptSentence(scriptBeat.sentence());
            beat.setScenePrompt(scriptBeat.scenePrompt());
            beat.setSceneType(SceneType.IMAGE);
            beat.setSelectedForGeneration(true);
            saved.add(beat);
        }
        beatRepository.saveAll(saved);
        return mapBeatsWithAssets(saved);
    }

    @Transactional
    public List<ProjectDtos.BeatDetail> generateAssets(Long projectId, ProjectRequests.GenerateAssets request) {
        Project project = getProjectForDefaultUser(projectId);
        List<TimelineBeat> beats = beatRepository.findByProjectIdOrderByOrderIndexAsc(projectId);
        List<BeatSnapshot> snapshots = beats.stream()
            .map(beat -> new BeatSnapshot(
                beat.getId(),
                beat.getOrderIndex(),
                beat.getScriptSentence(),
                beat.getScenePrompt(),
                beat.getSceneType(),
                beat.isSelectedForGeneration()
            ))
            .toList();
        String aspectRatio = request != null ? request.aspectRatio() : null;

        for (BeatSnapshot beat : snapshots) {
            assetRepository.deleteByBeatIdAndAssetType(beat.id(), AssetType.AUDIO);
            if (beat.sceneType() == SceneType.IMAGE) {
                assetRepository.deleteByBeatIdAndAssetType(beat.id(), AssetType.IMAGE);
            } else {
                assetRepository.deleteByBeatIdAndAssetType(beat.id(), AssetType.VIDEO);
            }
        }

        List<CompletableFuture<GeneratedAssetResult>> futures = new ArrayList<>();
        GeneratedAssetResult audioResult = generateCombinedAudio(project, snapshots);
        for (BeatSnapshot beat : snapshots) {
            if (!beat.selectedForGeneration()) {
                continue;
            }
            if (beat.scenePrompt() != null && !beat.scenePrompt().isBlank()) {
                futures.add(CompletableFuture.supplyAsync(
                    () -> toResult(beat.id(), generateSceneAsset(beat, aspectRatio, project.getVisualStylePrompt())),
                    aiExecutor
                ).handle((result, ex) -> handleAssetFailure(result, ex, beat.id(), beat.sceneType() == SceneType.IMAGE ? AssetType.IMAGE : AssetType.VIDEO)));
            }
        }

        Map<Long, TimelineBeat> beatMap = beats.stream()
            .collect(Collectors.toMap(TimelineBeat::getId, beat -> beat));
        List<GeneratedAssetResult> results = futures.stream()
            .map(CompletableFuture::join)
            .filter(result -> result != null && result.asset() != null)
            .collect(Collectors.toCollection(ArrayList::new));
        if (audioResult != null && audioResult.asset() != null) {
            results.add(audioResult);
        }
        List<GeneratedAsset> newAssets = results.stream()
            .map(result -> {
                GeneratedAsset asset = result.asset();
                asset.setBeat(beatMap.get(result.beatId()));
                return asset;
            })
            .toList();
        if (!newAssets.isEmpty()) {
            assetRepository.saveAll(newAssets);
        }

        return mapBeatsWithAssets(beats);
    }

    private GeneratedAsset generateAudioAsset(Project project, String input) {
        if (input == null || input.isBlank()) {
            return null;
        }
        TtsRequest ttsRequest = new TtsRequest();
        ttsRequest.setInput(input);
        if (project.getNarratorVoice() != null && !project.getNarratorVoice().isBlank()) {
            ttsRequest.setVoice(project.getNarratorVoice());
        }
        TtsResult ttsResult = ttsService.generate(ttsRequest);
        String responseFormat = ttsResult.getResponseFormat();
        String mimeType = resolveAudioMimeType(responseFormat);
        String dataUrl = toDataUrl(mimeType, ttsResult.getAudio());

        GeneratedAsset asset = new GeneratedAsset();
        asset.setAssetType(AssetType.AUDIO);
        asset.setUrl(dataUrl);
        asset.setProvider("openai");
        asset.setMimeType(mimeType);
        return asset;
    }

    private GeneratedAssetResult generateCombinedAudio(Project project, List<BeatSnapshot> snapshots) {
        List<BeatSnapshot> ordered = snapshots.stream()
            .filter(beat -> beat.scriptSentence() != null && !beat.scriptSentence().isBlank())
            .sorted(Comparator.comparingInt(BeatSnapshot::orderIndex))
            .toList();
        if (ordered.isEmpty()) {
            return null;
        }
        StringBuilder builder = new StringBuilder();
        for (BeatSnapshot beat : ordered) {
            if (builder.length() > 0) {
                builder.append("\n");
            }
            builder.append(beat.scriptSentence().trim());
        }
        GeneratedAsset asset = generateAudioAsset(project, builder.toString());
        if (asset == null) {
            return null;
        }
        BeatSnapshot first = ordered.getFirst();
        return new GeneratedAssetResult(first.id(), asset);
    }

    private GeneratedAsset generateSceneAsset(BeatSnapshot beat, String aspectRatio, String visualStylePrompt) {
        if (beat.scenePrompt() == null || beat.scenePrompt().isBlank()) {
            return null;
        }
        String combinedPrompt = applyVisualStyle(beat.scenePrompt(), visualStylePrompt);
        if (beat.sceneType() == SceneType.VIDEO) {
            Veo3FastRequest request = new Veo3FastRequest();
            request.setPrompt(combinedPrompt);
            request.setGenerateAudio(false);
            if (aspectRatio != null && !aspectRatio.isBlank()) {
                request.setAspectRatio(aspectRatio);
            }
            Veo3FastResult result = veo3FastService.generate(request);
            if (result.videoUrl() == null || result.videoUrl().isBlank()) {
                return null;
            }
            GeneratedAsset asset = new GeneratedAsset();
            asset.setAssetType(AssetType.VIDEO);
            asset.setUrl(result.videoUrl());
            asset.setProvider("fal");
            asset.setMimeType("video/mp4");
            return asset;
        }

        NanoBananaForm form = new NanoBananaForm();
        form.setPrompt(combinedPrompt);
        if (aspectRatio != null && !aspectRatio.isBlank()) {
            form.setAspectRatio(aspectRatio);
        }
        NanoBananaResult result = nanoBananaService.generate(form);
        String url = result.imageUrls().stream().findFirst().orElse(null);
        if (url == null || url.isBlank()) {
            return null;
        }
        GeneratedAsset asset = new GeneratedAsset();
        asset.setAssetType(AssetType.IMAGE);
        asset.setUrl(url);
        asset.setProvider("fal");
        asset.setMimeType("image/png");
        return asset;
    }

    private Project getProjectForDefaultUser(Long projectId) {
        AppUser user = defaultUserService.getOrCreateDefaultUser();
        return projectRepository.findByIdAndUserId(projectId, user.getId())
            .orElseThrow(() -> new IllegalArgumentException("Project not found."));
    }

    private ProjectDtos.ProjectSummary toSummary(Project project) {
        return new ProjectDtos.ProjectSummary(
            project.getId(),
            project.getName(),
            project.getGeneralPrompt(),
            project.getTone(),
            project.getNarratorVoice(),
            project.getNarratorVoicePrompt(),
            project.getVisualStylePrompt(),
            project.getCreatedAt(),
            project.getUpdatedAt()
        );
    }

    private ProjectDtos.ProjectDetail toDetail(Project project, List<ProjectDtos.BeatDetail> beats) {
        return new ProjectDtos.ProjectDetail(
            project.getId(),
            project.getName(),
            project.getGeneralPrompt(),
            project.getTone(),
            project.getNarratorVoice(),
            project.getNarratorVoicePrompt(),
            project.getVisualStylePrompt(),
            project.getCreatedAt(),
            project.getUpdatedAt(),
            beats
        );
    }

    private List<ProjectDtos.BeatDetail> mapBeatsWithAssets(List<TimelineBeat> beats) {
        List<Long> beatIds = beats.stream().map(TimelineBeat::getId).toList();
        Map<Long, List<ProjectDtos.AssetDetail>> assetMap = new HashMap<>();
        if (!beatIds.isEmpty()) {
            List<GeneratedAsset> assets = assetRepository.findByBeatIdIn(beatIds);
            assetMap = assets.stream()
                .sorted(Comparator.comparing(GeneratedAsset::getCreatedAt))
                .collect(Collectors.groupingBy(
                    asset -> asset.getBeat().getId(),
                    Collectors.mapping(this::toAssetDetail, Collectors.toList())
                ));
        }
        Map<Long, List<ProjectDtos.AssetDetail>> finalAssetMap = assetMap;
        return beats.stream()
            .sorted(Comparator.comparingInt(TimelineBeat::getOrderIndex))
            .map(beat -> toBeatDetail(beat, finalAssetMap.getOrDefault(beat.getId(), List.of())))
            .toList();
    }

    private ProjectDtos.BeatDetail toBeatDetail(TimelineBeat beat, List<ProjectDtos.AssetDetail> assets) {
        return new ProjectDtos.BeatDetail(
            beat.getId(),
            beat.getOrderIndex(),
            beat.getScriptSentence(),
            beat.getScenePrompt(),
            beat.getSceneType().name(),
            beat.isSelectedForGeneration(),
            beat.getCreatedAt(),
            beat.getUpdatedAt(),
            assets
        );
    }

    private ProjectDtos.AssetDetail toAssetDetail(GeneratedAsset asset) {
        return new ProjectDtos.AssetDetail(
            asset.getId(),
            asset.getAssetType().name(),
            asset.getUrl(),
            asset.getProvider(),
            asset.getMimeType(),
            asset.getDurationSeconds(),
            asset.getCreatedAt()
        );
    }

    private SceneType parseSceneType(String value) {
        if (value == null || value.isBlank()) {
            return SceneType.IMAGE;
        }
        String normalized = value.trim().toUpperCase(Locale.US);
        return SceneType.valueOf(normalized);
    }

    private String buildScriptPrompt(Project project, Integer beatCount, Integer durationSeconds) {
        Integer resolvedDuration = durationSeconds != null && durationSeconds > 0 ? durationSeconds : null;
        int count;
        if (beatCount != null && beatCount > 0) {
            count = beatCount;
        } else if (resolvedDuration != null) {
            count = Math.max(2, (int) Math.round(resolvedDuration / 5.0));
        } else {
            count = 6;
        }
        StringBuilder builder = new StringBuilder();
        builder.append("Generate an ad script as JSON only. Return a JSON array of objects.\n");
        builder.append("Each object must have fields: sentence, scenePrompt.\n");
        builder.append("Number of beats: ").append(count).append(".\n");
        if (resolvedDuration != null) {
            builder.append("Target narration duration: ").append(resolvedDuration).append(" seconds.\n");
            builder.append("Aim for the full script to read in about that duration.\n");
        }
        if (project.getTone() != null && !project.getTone().isBlank()) {
            builder.append("Tone: ").append(project.getTone()).append(".\n");
        }
        if (project.getNarratorVoice() != null && !project.getNarratorVoice().isBlank()) {
            builder.append("Narrator voice: ").append(project.getNarratorVoice()).append(".\n");
        }
        if (project.getNarratorVoicePrompt() != null && !project.getNarratorVoicePrompt().isBlank()) {
            builder.append("Narrator voice notes: ").append(project.getNarratorVoicePrompt()).append(".\n");
        }
        if (project.getGeneralPrompt() != null && !project.getGeneralPrompt().isBlank()) {
            builder.append("Concept: ").append(project.getGeneralPrompt()).append(".\n");
        }
        builder.append("Keep sentences concise and cinematic.");
        return builder.toString();
    }

    private List<ScriptBeat> parseScript(String output) {
        if (output == null || output.isBlank()) {
            return List.of();
        }
        String trimmed = output.trim();
        String jsonCandidate = extractJsonArray(trimmed).orElse(trimmed);
        try {
            JsonElement element = JsonParser.parseString(jsonCandidate);
            if (element.isJsonArray()) {
                return parseJsonArray(element.getAsJsonArray());
            }
        } catch (Exception ex) {
            log.warn("Failed to parse OpenRouter output as JSON array, falling back to text parse.");
        }
        return fallbackParse(trimmed);
    }

    private Optional<String> extractJsonArray(String output) {
        int start = output.indexOf('[');
        int end = output.lastIndexOf(']');
        if (start >= 0 && end > start) {
            return Optional.of(output.substring(start, end + 1));
        }
        return Optional.empty();
    }

    private List<ScriptBeat> parseJsonArray(JsonArray array) {
        List<ScriptBeat> beats = new ArrayList<>();
        for (JsonElement element : array) {
            if (!element.isJsonObject()) {
                continue;
            }
            JsonObject obj = element.getAsJsonObject();
            String sentence = getString(obj, "sentence");
            if (sentence == null) {
                sentence = getString(obj, "scriptSentence");
            }
            String prompt = getString(obj, "scenePrompt");
            if (prompt == null) {
                prompt = getString(obj, "prompt");
            }
            if (sentence == null || sentence.isBlank()) {
                continue;
            }
            beats.add(new ScriptBeat(sentence, prompt == null ? "" : prompt));
        }
        return beats;
    }

    private String getString(JsonObject obj, String field) {
        if (obj.has(field) && obj.get(field).isJsonPrimitive()) {
            return obj.get(field).getAsString();
        }
        return null;
    }

    private List<ScriptBeat> fallbackParse(String output) {
        List<ScriptBeat> beats = new ArrayList<>();
        String[] lines = output.split("\\r?\\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isBlank()) {
                continue;
            }
            beats.add(new ScriptBeat(trimmed, ""));
        }
        if (!beats.isEmpty()) {
            return beats;
        }
        String[] sentences = output.split("\\. ");
        for (String sentence : sentences) {
            String trimmed = sentence.trim();
            if (!trimmed.isBlank()) {
                beats.add(new ScriptBeat(trimmed.endsWith(".") ? trimmed : trimmed + ".", ""));
            }
        }
        return beats;
    }

    private String resolveAudioMimeType(String responseFormat) {
        if (responseFormat == null || responseFormat.isBlank()) {
            return "audio/mpeg";
        }
        String format = responseFormat.toLowerCase(Locale.US);
        return switch (format) {
            case "wav" -> "audio/wav";
            case "mp3" -> "audio/mpeg";
            case "aac" -> "audio/aac";
            case "opus" -> "audio/ogg";
            default -> "audio/mpeg";
        };
    }

    private String toDataUrl(String mimeType, byte[] data) {
        String encoded = Base64.getEncoder().encodeToString(data);
        return "data:" + mimeType + ";base64," + encoded;
    }

    private String applyVisualStyle(String scenePrompt, String visualStylePrompt) {
        if (visualStylePrompt == null || visualStylePrompt.isBlank()) {
            return scenePrompt;
        }
        return scenePrompt + "\nStyle: " + visualStylePrompt.trim();
    }

    private record ScriptBeat(String sentence, String scenePrompt) {
    }

    private GeneratedAssetResult toResult(Long beatId, GeneratedAsset asset) {
        if (asset == null) {
            return null;
        }
        return new GeneratedAssetResult(beatId, asset);
    }

    private GeneratedAssetResult handleAssetFailure(GeneratedAssetResult result, Throwable ex, Long beatId, AssetType assetType) {
        if (ex != null) {
            log.warn("Asset generation failed for beat {} ({})", beatId, assetType, ex);
            return null;
        }
        return result;
    }

    private record GeneratedAssetResult(Long beatId, GeneratedAsset asset) {
    }

    private record BeatSnapshot(
        Long id,
        int orderIndex,
        String scriptSentence,
        String scenePrompt,
        SceneType sceneType,
        boolean selectedForGeneration
    ) {
    }
}
