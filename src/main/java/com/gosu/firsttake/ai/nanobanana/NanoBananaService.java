package com.gosu.firsttake.ai.nanobanana;

import ai.fal.client.FalClient;
import ai.fal.client.Output;
import ai.fal.client.SubscribeOptions;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class NanoBananaService {
    private static final String MODEL_ID = "fal-ai/nano-banana";

    private final FalClient falClient;

    public NanoBananaService() {
        this.falClient = FalClient.withEnvCredentials();
    }

    public NanoBananaResult generate(NanoBananaForm form) {
        Map<String, Object> input = new HashMap<>();
        input.put("prompt", form.getPrompt());
        if (form.getNumImages() != null) {
            input.put("num_images", form.getNumImages());
        }
        if (form.getAspectRatio() != null && !form.getAspectRatio().isBlank()) {
            input.put("aspect_ratio", form.getAspectRatio());
        }
        if (form.getOutputFormat() != null && !form.getOutputFormat().isBlank()) {
            input.put("output_format", form.getOutputFormat());
        }

        log.info("Submitting Nano Banana request: prompt='{}', aspectRatio='{}', outputFormat='{}', numImages='{}'",
            form.getPrompt(),
            form.getAspectRatio(),
            form.getOutputFormat(),
            form.getNumImages()
        );

        Output<JsonObject> output = falClient.subscribe(
            MODEL_ID,
            SubscribeOptions.<JsonObject>builder()
                .input(input)
                .resultType(JsonObject.class)
                .build()
        );

        JsonObject result = output == null ? null : output.getData();
        List<String> imageUrls = new ArrayList<>();
        String description = "";
        if (result != null) {
            if (result.has("description") && result.get("description").isJsonPrimitive()) {
                description = result.get("description").getAsString();
            }
            if (result.has("images") && result.get("images").isJsonArray()) {
                for (JsonElement element : result.getAsJsonArray("images")) {
                    if (!element.isJsonObject()) {
                        continue;
                    }
                    JsonObject image = element.getAsJsonObject();
                    if (image.has("url") && image.get("url").isJsonPrimitive()) {
                        imageUrls.add(image.get("url").getAsString());
                    }
                }
            }
        }

        log.info("Nano Banana response images: {}", imageUrls);
        return new NanoBananaResult(imageUrls, description);
    }
}
