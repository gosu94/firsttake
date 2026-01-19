package com.gosu.firsttake.ai.tts;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class TtsService {
    private static final URI OPENAI_TTS_ENDPOINT = URI.create("https://api.openai.com/v1/audio/speech");

    private final HttpClient httpClient;
    private final String apiKey;
    private final String defaultModel;

    public TtsService(@Value("${openai.tts.model:gpt-4o-mini-tts}") String defaultModel) {
        this.httpClient = HttpClient.newHttpClient();
        this.apiKey = System.getenv("OPENAI_API_KEY");
        this.defaultModel = defaultModel;
    }

    public TtsResult generate(TtsRequest request) {
        if (request == null || request.getInput() == null || request.getInput().isBlank()) {
            throw new IllegalArgumentException("TTS input must not be blank.");
        }
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("OPENAI_API_KEY is not set.");
        }

        String model = request.getModel() != null && !request.getModel().isBlank()
            ? request.getModel()
            : defaultModel;
        String voice = TtsVoice.fromId(request.getVoice())
            .map(TtsVoice::id)
            .orElse(TtsVoice.ALLOY.id());
        String responseFormat = request.getResponseFormat() != null && !request.getResponseFormat().isBlank()
            ? request.getResponseFormat()
            : "mp3";

        JsonObject payload = new JsonObject();
        payload.addProperty("model", model);
        payload.addProperty("input", request.getInput());
        payload.addProperty("voice", voice);
        payload.addProperty("response_format", responseFormat);
        if (request.getSpeed() != null) {
            payload.addProperty("speed", request.getSpeed());
        }

        log.info("Submitting OpenAI TTS request: model='{}', voice='{}', responseFormat='{}', speed='{}', inputLength='{}'",
            model,
            voice,
            responseFormat,
            request.getSpeed(),
            request.getInput().length()
        );

        HttpRequest httpRequest = HttpRequest.newBuilder(OPENAI_TTS_ENDPOINT)
            .header("Authorization", "Bearer " + apiKey)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
            .build();

        HttpResponse<byte[]> response;
        try {
            response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("OpenAI TTS request interrupted.", ex);
        } catch (IOException ex) {
            throw new IllegalStateException("OpenAI TTS request failed.", ex);
        }

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            String errorBody = new String(response.body(), StandardCharsets.UTF_8);
            String errorMessage = extractErrorMessage(errorBody);
            throw new IllegalStateException("OpenAI TTS error (" + response.statusCode() + "): " + errorMessage);
        }

        log.info("OpenAI TTS response size: {} bytes", response.body().length);
        return new TtsResult(response.body(), responseFormat);
    }

    private String extractErrorMessage(String body) {
        if (body == null || body.isBlank()) {
            return "Empty error response.";
        }
        try {
            JsonObject json = JsonParser.parseString(body).getAsJsonObject();
            if (json.has("error") && json.get("error").isJsonObject()) {
                JsonObject error = json.getAsJsonObject("error");
                if (error.has("message") && error.get("message").isJsonPrimitive()) {
                    return error.get("message").getAsString();
                }
            }
        } catch (Exception ex) {
            return body;
        }
        return body;
    }
}
