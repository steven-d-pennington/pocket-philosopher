import type { ProviderStatistics } from "../lib/ai/provider-registry";

const analyticsCapture = jest.fn();
const openaiHealthMock = jest.fn();
const anthropicHealthMock = jest.fn();
const togetherHealthMock = jest.fn();
const ollamaHealthMock = jest.fn();
const openaiEmbeddingMock = jest.fn();
const anthropicEmbeddingMock = jest.fn();
const togetherEmbeddingMock = jest.fn();
const ollamaEmbeddingMock = jest.fn();

jest.mock("../lib/analytics/server", () => ({
  serverAnalytics: {
    capture: analyticsCapture,
    isEnabled: true,
  },
}));

jest.mock("../lib/ai/providers/openai", () => ({
  createOpenAIChatStream: jest.fn(),
  checkOpenAIHealth: openaiHealthMock,
  createOpenAIEmbedding: openaiEmbeddingMock,
}));

jest.mock("../lib/ai/providers/anthropic", () => ({
  createAnthropicChatStream: jest.fn(),
  checkAnthropicHealth: anthropicHealthMock,
  createAnthropicEmbedding: anthropicEmbeddingMock,
}));

jest.mock("../lib/ai/providers/together", () => ({
  createTogetherChatStream: jest.fn(),
  createTogetherEmbedding: togetherEmbeddingMock,
  checkTogetherHealth: togetherHealthMock,
}));

jest.mock("../lib/ai/providers/ollama", () => ({
  createOllamaChatStream: jest.fn(),
  checkOllamaHealth: ollamaHealthMock,
  createOllamaEmbedding: ollamaEmbeddingMock,
}));

describe("provider registry telemetry", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("caches health checks and aggregates provider statistics", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-01-01T00:00:00Z"));
    jest.resetModules();

    openaiHealthMock.mockReset().mockImplementation(async () => ({
      providerId: "openai",
      status: "healthy" as const,
      latencyMs: 45,
      checkedAt: Date.now(),
    }));
    anthropicHealthMock.mockReset().mockImplementation(async () => ({
      providerId: "anthropic",
      status: "degraded" as const,
      latencyMs: 120,
      checkedAt: Date.now(),
    }));
    togetherHealthMock.mockReset().mockImplementation(async () => ({
      providerId: "together",
      status: "healthy" as const,
      latencyMs: 90,
      checkedAt: Date.now(),
    }));
    ollamaHealthMock.mockReset().mockImplementation(async () => ({
      providerId: "ollama",
      status: "unavailable" as const,
      latencyMs: 200,
      checkedAt: Date.now(),
      error: { message: "offline" },
    }));

    const registry = await import("../lib/ai/provider-registry");

    await registry.getActiveChatProvider();
    expect(openaiHealthMock).toHaveBeenCalledTimes(1);

    await registry.getActiveChatProvider();
    expect(openaiHealthMock).toHaveBeenCalledTimes(1);

    await registry.getProviderHealth("anthropic");
    await registry.getProviderHealth("ollama");

    registry.recordProviderSuccess("openai", { latencyMs: 55 });
    registry.recordProviderFailure("openai", new Error("boom"));
    registry.recordProviderFailure("ollama", new Error("offline"));

    const stats = registry.getProviderStatistics();
    const indexById = Object.fromEntries(stats.map((item: ProviderStatistics) => [item.providerId, item]));

    expect(indexById.openai).toMatchObject({
      status: "healthy",
      successes: 1,
      failures: 1,
      degraded: 0,
      lastLatencyMs: 55,
    });

    expect(indexById.anthropic).toMatchObject({
      status: "degraded",
      degraded: 1,
    });

    expect(indexById.ollama).toMatchObject({
      status: "unavailable",
      failures: 2,
    });

    expect(indexById.together.status).toBe("unknown");
  });

  it("prioritizes embedding providers with graceful failover and health cache ttl", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-01-02T00:00:00Z"));
    jest.resetModules();

    openaiHealthMock.mockReset().mockResolvedValue({
      providerId: "openai",
      status: "unavailable" as const,
      checkedAt: Date.now(),
    });
    togetherHealthMock.mockReset().mockResolvedValue({
      providerId: "together",
      status: "degraded" as const,
      latencyMs: 200,
      checkedAt: Date.now(),
    });
    anthropicHealthMock.mockReset().mockResolvedValue({
      providerId: "anthropic",
      status: "healthy" as const,
      latencyMs: 80,
      checkedAt: Date.now(),
    });
    ollamaHealthMock.mockReset().mockResolvedValue({
      providerId: "ollama",
      status: "healthy" as const,
      latencyMs: 120,
      checkedAt: Date.now(),
    });

    const registry = await import("../lib/ai/provider-registry");

    const selection = await registry.getActiveEmbeddingProvider();
    expect(selection?.provider.id).toBe("anthropic");
    expect(selection?.fallbackUsed).toBe(false);
    expect(selection?.attempts).toEqual([
      { providerId: "openai", status: "unavailable" },
      { providerId: "together", status: "degraded" },
      { providerId: "anthropic", status: "healthy" },
    ]);

    await registry.getActiveEmbeddingProvider();
    expect(openaiHealthMock).toHaveBeenCalledTimes(1);
    expect(togetherHealthMock).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(31_000);
    await registry.getActiveEmbeddingProvider();
    expect(openaiHealthMock).toHaveBeenCalledTimes(2);
    expect(togetherHealthMock).toHaveBeenCalledTimes(2);
  });
});
