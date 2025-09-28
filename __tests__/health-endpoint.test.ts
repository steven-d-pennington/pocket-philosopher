const loggerInfo = jest.fn();
const loggerWarn = jest.fn();
const loggerError = jest.fn();

type MockLogger = {
  requestId: string;
  info: jest.Mock;
  warn: jest.Mock;
  error: jest.Mock;
  child: jest.Mock;
  withUser: jest.Mock;
};

const mockLogger: MockLogger = {
  requestId: "req-test",
  info: loggerInfo,
  warn: loggerWarn,
  error: loggerError,
  child: jest.fn(),
  withUser: jest.fn(),
};

mockLogger.child.mockReturnValue(mockLogger);
mockLogger.withUser.mockReturnValue(mockLogger);

jest.mock("../lib/logging/logger", () => ({
  createRequestLogger: jest.fn(() => mockLogger),
}));

const mockSuccess = jest.fn((payload: unknown, init?: unknown) => ({ payload, init }));
const mockError = jest.fn();

jest.mock("../app/api/_lib/response", () => ({
  success: mockSuccess,
  error: mockError,
}));

jest.mock("../lib/analytics/server", () => ({
  serverAnalytics: { capture: jest.fn(), isEnabled: true },
}));

jest.mock("../lib/env-validation", () => ({
  env: {
    OPENAI_API_KEY: "sk-openai",
    ANTHROPIC_API_KEY: "sk-anthropic",
    TOGETHER_API_KEY: undefined,
    OLLAMA_URL: null,
  },
}));

const selectMock = jest.fn(() => ({
  limit: jest.fn().mockResolvedValue({ data: [], error: null }),
}));
const fromMock = jest.fn(() => ({ select: selectMock }));

jest.mock("../lib/supabase/service-role-client", () => ({
  getSupabaseServiceRoleClient: jest.fn(() => ({
    from: fromMock,
  })),
}));

jest.mock("../lib/ai/provider-registry", () => ({
  getChatProviderDiagnostics: jest.fn(() => ({
    providers: {
      openai: {
        status: "healthy",
        checkedAt: 1700000000000,
        latencyMs: 50,
        error: null,
        successCount: 4,
        failureCount: 1,
        lastSuccessAt: 1699990000000,
        lastFailureAt: 1699980000000,
      },
      anthropic: {
        status: "degraded",
        checkedAt: 1700001000000,
        latencyMs: 120,
        error: { message: "rate limited" },
        successCount: 1,
        failureCount: 2,
        lastSuccessAt: 1699995000000,
        lastFailureAt: 1699996000000,
      },
    },
    lastSelected: {
      providerId: "openai",
      status: "healthy",
      fallbackUsed: false,
      selectedAt: 1700002000000,
    },
  })),
  getProviderStatistics: jest.fn(() => [
    {
      providerId: "openai",
      status: "healthy",
      successes: 4,
      failures: 1,
      degraded: 0,
      lastLatencyMs: 48,
      lastCheckedAt: 1700000000000,
    },
    {
      providerId: "anthropic",
      status: "degraded",
      successes: 1,
      failures: 2,
      degraded: 3,
      lastLatencyMs: 120,
      lastCheckedAt: 1700001000000,
    },
    {
      providerId: "ollama",
      status: "unavailable",
      successes: 0,
      failures: 5,
      degraded: 0,
      lastLatencyMs: null,
      lastCheckedAt: 1700001500000,
    },
  ]),
}));

describe("/api/health", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns provider telemetry snapshot", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2023-11-14T22:13:20Z"));
    const { GET } = await import("../app/api/health/route");

    const response = await GET({} as Request);

    expect(mockError).not.toHaveBeenCalled();
    expect(mockSuccess).toHaveBeenCalledTimes(1);

    const [payload, init] = mockSuccess.mock.calls[0];
    expect(init).toMatchObject({ requestId: "req-test" });
    expect(payload).toMatchInlineSnapshot(`
      {
        "dependencies": {
          "aiProviders": {
            "configuration": {
              "anthropic": "configured",
              "ollama": "missing",
              "openai": "configured",
              "together": "missing",
            },
            "selection": {
              "fallbackUsed": false,
              "providerId": "openai",
              "providerStatus": "healthy",
              "selectedAt": "2023-11-14T22:46:40.000Z",
            },
            "stats": {
              "anthropic": {
                "degradedCount": 3,
                "error": {
                  "message": "rate limited",
                },
                "failureCount": 2,
                "lastCheckedAt": "2023-11-14T22:30:00.000Z",
                "lastFailureAt": "2023-11-14T21:06:40.000Z",
                "lastSuccessAt": "2023-11-14T20:50:00.000Z",
                "latencyMs": 120,
                "status": "degraded",
                "successCount": 1,
              },
              "ollama": {
                "degradedCount": 0,
                "error": null,
                "failureCount": 5,
                "lastCheckedAt": "2023-11-14T22:38:20.000Z",
                "lastFailureAt": null,
                "lastSuccessAt": null,
                "latencyMs": null,
                "status": "unavailable",
                "successCount": 0,
              },
              "openai": {
                "degradedCount": 0,
                "error": null,
                "failureCount": 1,
                "lastCheckedAt": "2023-11-14T22:13:20.000Z",
                "lastFailureAt": "2023-11-14T16:40:00.000Z",
                "lastSuccessAt": "2023-11-14T19:26:40.000Z",
                "latencyMs": 48,
                "status": "healthy",
                "successCount": 4,
              },
            },
          },
          "analytics": {
            "status": "ok",
          },
          "supabase": {
            "latencyMs": 0,
            "message": null,
            "status": "ok",
          },
        },
        "status": "ok",
        "timestamp": "2023-11-14T22:13:20.000Z",
      }
    `);

    expect(loggerInfo).toHaveBeenCalled();
    expect(loggerWarn).toHaveBeenCalledWith(
      "Provider health degraded",
      expect.objectContaining({ providerId: "anthropic" }),
    );
    expect(loggerWarn).toHaveBeenCalledWith(
      "Provider health degraded",
      expect.objectContaining({ providerId: "ollama" }),
    );
    expect(response).toEqual({ payload, init });
  });
});
