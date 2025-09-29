afterAll(async () => {
  const analyticsModule = await import("@/lib/analytics/server");
  const shutdown = analyticsModule.serverAnalytics?.shutdown;

  if (typeof shutdown === "function") {
    await shutdown.call(analyticsModule.serverAnalytics);
  }
});
