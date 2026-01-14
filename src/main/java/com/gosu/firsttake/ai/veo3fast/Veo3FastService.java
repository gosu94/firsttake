package com.gosu.firsttake.ai.veo3fast;

import ai.fal.client.FalClient;
import ai.fal.client.Output;
import ai.fal.client.SubscribeOptions;
import com.google.gson.JsonObject;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class Veo3FastService {
    private static final String MODEL_ID = "fal-ai/veo3/fast";

    private final FalClient falClient;

    public Veo3FastService() {
        this.falClient = FalClient.withEnvCredentials();
    }

    public Veo3FastResult generate(Veo3FastRequest request) {
        Map<String, Object> input = new HashMap<>();
        input.put("prompt", request.getPrompt());
        if (request.getAspectRatio() != null && !request.getAspectRatio().isBlank()) {
            input.put("aspect_ratio", request.getAspectRatio());
        }
        if (request.getDuration() != null && !request.getDuration().isBlank()) {
            input.put("duration", request.getDuration());
        }
        if (request.getResolution() != null && !request.getResolution().isBlank()) {
            input.put("resolution", request.getResolution());
        }
        if (request.getGenerateAudio() != null) {
            input.put("generate_audio", request.getGenerateAudio());
        }
        if (request.getAutoFix() != null) {
            input.put("auto_fix", request.getAutoFix());
        }
        if (request.getNegativePrompt() != null && !request.getNegativePrompt().isBlank()) {
            input.put("negative_prompt", request.getNegativePrompt());
        }
        if (request.getSeed() != null) {
            input.put("seed", request.getSeed());
        }

        log.info("Submitting Veo3 Fast request: prompt='{}', aspectRatio='{}', duration='{}', resolution='{}', generateAudio='{}', autoFix='{}', seed='{}'",
            request.getPrompt(),
            request.getAspectRatio(),
            request.getDuration(),
            request.getResolution(),
            request.getGenerateAudio(),
            request.getAutoFix(),
            request.getSeed()
        );

        Output<JsonObject> output = falClient.subscribe(
            MODEL_ID,
            SubscribeOptions.<JsonObject>builder()
                .input(input)
                .resultType(JsonObject.class)
                .build()
        );

        JsonObject result = output == null ? null : output.getData();
        String videoUrl = null;
        if (result != null && result.has("video") && result.get("video").isJsonObject()) {
            JsonObject video = result.getAsJsonObject("video");
            if (video.has("url") && video.get("url").isJsonPrimitive()) {
                videoUrl = video.get("url").getAsString();
            }
        }

        log.info("Veo3 Fast response video URL: {}", videoUrl);
        return new Veo3FastResult(videoUrl);
    }
}
