let createRequestLogger: typeof import("@/lib/logging/logger")["createRequestLogger"];

beforeAll(async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.test";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "anon-key";

  const loggerModule = await import("@/lib/logging/logger");
  createRequestLogger = loggerModule.createRequestLogger;
});

describe("createRequestLogger", () => {
  it("generates a logger with stable requestId", () => {
    const logger = createRequestLogger({ route: "/api/test", requestId: "req-123" });

    expect(logger.requestId).toBe("req-123");

    const child = logger.child({ metadata: { operation: "child" } });
    expect(child.requestId).toBe("req-123");
  });

  it("allows attaching user context", () => {
    const logger = createRequestLogger({ route: "/api/test" });
    const withUser = logger.withUser("user-789");

    expect(withUser.requestId).toBe(logger.requestId);
    const secondary = withUser.child({ metadata: { userId: "user-789" } });
    expect(secondary.requestId).toBe(logger.requestId);
  });
});
