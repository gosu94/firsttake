package com.gosu.firsttake.ai.openrouter;

public record OpenRouterUsage(Integer promptTokens, Integer completionTokens, Integer totalTokens, Double cost) {
}
