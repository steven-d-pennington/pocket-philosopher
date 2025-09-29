import { expect, test } from "@playwright/test";

test.describe("PWA offline readiness", () => {
  test("caches fonts and serves offline page without a network", async ({ page, context }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.waitForFunction(async () => {
      const registration = await navigator.serviceWorker?.ready;
      return Boolean(registration);
    });

    const fontCacheEntries = await page.evaluate(async () => {
      const cache = await caches.open("pp-fonts");
      const keys = await cache.keys();
      return keys.map((request) => new URL(request.url).pathname);
    });

    expect(fontCacheEntries.some((pathname) => pathname.endsWith(".woff2"))).toBeTruthy();

    await page.goto("/offline");
    await page.waitForLoadState("networkidle");

    try {
      await context.setOffline(true);
      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: /You're offline/i })).toBeVisible();
    } finally {
      await context.setOffline(false);
    }
  });
});
