package com.gosu.firsttake.ai.openrouter;

public record OpenRouterResult(String output, String reasoning, Boolean partial, String error, OpenRouterUsage usage) {
}
