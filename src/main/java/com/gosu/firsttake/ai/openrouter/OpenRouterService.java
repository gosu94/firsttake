package com.gosu.firsttake.ai.openrouter;

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
public class OpenRouterService {
    private static final String MODEL_ID = "openrouter/router";

    private final FalClient falClient;

    public OpenRouterService() {
        this.falClient = FalClient.withEnvCredentials();
    }

    public OpenRouterResult generate(OpenRouterRequest request) {
        Map<String, Object> input = new HashMap<>();
        input.put("prompt", request.getPrompt());
        if (request.getSystemPrompt() != null && !request.getSystemPrompt().isBlank()) {
            input.put("system_prompt", request.getSystemPrompt());
        }
        if (request.getModel() != null && !request.getModel().isBlank()) {
            input.put("model", request.getModel());
        }
        if (request.getReasoning() != null) {
            input.put("reasoning", request.getReasoning());
        }
        if (request.getTemperature() != null) {
            input.put("temperature", request.getTemperature());
        }
        if (request.getMaxTokens() != null) {
            input.put("max_tokens", request.getMaxTokens());
        }

        log.info("Submitting OpenRouter request: model='{}', temperature='{}', maxTokens='{}'",
            request.getModel(),
            request.getTemperature(),
            request.getMaxTokens()
        );

        Output<JsonObject> output = falClient.subscribe(
            MODEL_ID,
            SubscribeOptions.<JsonObject>builder()
                .input(input)
                .resultType(JsonObject.class)
                .build()
        );

        JsonObject result = output == null ? null : output.getData();
        String text = null;
        String reasoning = null;
        Boolean partial = null;
        String error = null;
        OpenRouterUsage usage = null;

        if (result != null) {
            if (result.has("output") && result.get("output").isJsonPrimitive()) {
                text = result.get("output").getAsString();
            }
            if (result.has("reasoning") && result.get("reasoning").isJsonPrimitive()) {
                reasoning = result.get("reasoning").getAsString();
            }
            if (result.has("partial") && result.get("partial").isJsonPrimitive()) {
                partial = result.get("partial").getAsBoolean();
            }
            if (result.has("error") && result.get("error").isJsonPrimitive()) {
                error = result.get("error").getAsString();
            }
            if (result.has("usage") && result.get("usage").isJsonObject()) {
                JsonObject usageJson = result.getAsJsonObject("usage");
                Integer promptTokens = usageJson.has("prompt_tokens") ? usageJson.get("prompt_tokens").getAsInt() : null;
                Integer completionTokens = usageJson.has("completion_tokens") ? usageJson.get("completion_tokens").getAsInt() : null;
                Integer totalTokens = usageJson.has("total_tokens") ? usageJson.get("total_tokens").getAsInt() : null;
                Double cost = usageJson.has("cost") ? usageJson.get("cost").getAsDouble() : null;
                usage = new OpenRouterUsage(promptTokens, completionTokens, totalTokens, cost);
            }
        }

        log.info("OpenRouter response length: {}, error: {}", text == null ? 0 : text.length(), error);
        return new OpenRouterResult(text, reasoning, partial, error, usage);
    }
}
