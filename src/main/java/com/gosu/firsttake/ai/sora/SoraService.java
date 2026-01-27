package com.gosu.firsttake.ai.sora;

import ai.fal.client.FalClient;
import ai.fal.client.Output;
import ai.fal.client.queue.QueueResultOptions;
import ai.fal.client.queue.QueueStatus;
import ai.fal.client.queue.QueueSubmitOptions;
import ai.fal.client.queue.QueueSubscribeOptions;
import com.google.gson.JsonObject;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class SoraService {
    private static final String MODEL_ID = "fal-ai/sora-2/text-to-video";

    private final FalClient falClient;

    public SoraService() {
        this.falClient = FalClient.withEnvCredentials();
    }

    public SoraResult generate(SoraRequest request) {
        Map<String, Object> input = new HashMap<>();
        input.put("prompt", request.getPrompt());
        if (request.getResolution() != null && !request.getResolution().isBlank()) {
            input.put("resolution", request.getResolution());
        }
        if (request.getAspectRatio() != null && !request.getAspectRatio().isBlank()) {
            input.put("aspect_ratio", request.getAspectRatio());
        }
        if (request.getDuration() != null) {
            input.put("duration", request.getDuration());
        }
        if (request.getDeleteVideo() != null) {
            input.put("delete_video", request.getDeleteVideo());
        }
        if (request.getModel() != null && !request.getModel().isBlank()) {
            input.put("model", request.getModel());
        }
        log.info("Submitting Sora request: prompt='{}', aspectRatio='{}', duration='{}', resolution='{}', deleteVideo='{}', model='{}'",
            request.getPrompt(),
            request.getAspectRatio(),
            request.getDuration(),
            request.getResolution(),
            request.getDeleteVideo(),
            request.getModel()
        );

        QueueStatus.InQueue queued = falClient.queue().submit(
            MODEL_ID,
            QueueSubmitOptions.builder()
                .input(input)
                .build()
        );

        if (queued == null || queued.getRequestId() == null || queued.getRequestId().isBlank()) {
            log.warn("Sora request did not return a requestId.");
            return new SoraResult(null, null, null, null);
        }

        String requestId = queued.getRequestId();
        falClient.queue().subscribeToStatus(
            MODEL_ID,
            QueueSubscribeOptions.builder()
                .requestId(requestId)
                .build()
        );

        Output<JsonObject> output = falClient.queue().result(
            MODEL_ID,
            QueueResultOptions.<JsonObject>builder()
                .requestId(requestId)
                .resultType(JsonObject.class)
                .build()
        );

        JsonObject result = output == null ? null : output.getData();
        String videoUrl = null;
        String videoId = null;
        String thumbnailUrl = null;
        String spritesheetUrl = null;
        if (result != null) {
            if (result.has("video_id") && result.get("video_id").isJsonPrimitive()) {
                videoId = result.get("video_id").getAsString();
            }
            if (result.has("video") && result.get("video").isJsonObject()) {
                JsonObject video = result.getAsJsonObject("video");
                if (video.has("url") && video.get("url").isJsonPrimitive()) {
                    videoUrl = video.get("url").getAsString();
                }
            }
            if (result.has("thumbnail") && result.get("thumbnail").isJsonObject()) {
                JsonObject thumbnail = result.getAsJsonObject("thumbnail");
                if (thumbnail.has("url") && thumbnail.get("url").isJsonPrimitive()) {
                    thumbnailUrl = thumbnail.get("url").getAsString();
                }
            }
            if (result.has("spritesheet") && result.get("spritesheet").isJsonObject()) {
                JsonObject spritesheet = result.getAsJsonObject("spritesheet");
                if (spritesheet.has("url") && spritesheet.get("url").isJsonPrimitive()) {
                    spritesheetUrl = spritesheet.get("url").getAsString();
                }
            }
        }

        log.info("Sora response video URL: {}", videoUrl);
        return new SoraResult(videoUrl, videoId, thumbnailUrl, spritesheetUrl);
    }
}
