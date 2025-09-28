import type { ProviderStatistics } from "../lib/ai/provider-registry";

const analyticsCapture = jest.fn();
const openaiHealthMock = jest.fn();
const anthropicHealthMock = jest.fn();
const togetherHealthMock = jest.fn();
const ollamaHealthMock = jest.fn();

jest.mock("../lib/analytics/server", () => ({
  serverAnalytics: {
    capture: analyticsCapture,
    isEnabled: true,
  },
}));

jest.mock("../lib/ai/providers/openai", () => ({
  createOpenAIChatStream: jest.fn(),
  checkOpenAIHealth: openaiHealthMock,
  createOpenAIEmbedding: jest.fn(),
}));

jest.mock("../lib/ai/providers/anthropic", () => ({
  createAnthropicChatStream: jest.fn(),
  checkAnthropicHealth: anthropicHealthMock,
}));

jest.mock("../lib/ai/providers/together", () => ({
  createTogetherChatStream: jest.fn(),
  createTogetherEmbedding: jest.fn(),
  checkTogetherHealth: togetherHealthMock,
}));

jest.mock("../lib/ai/providers/ollama", () => ({
  createOllamaChatStream: jest.fn(),
  checkOllamaHealth: ollamaHealthMock,
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
});
