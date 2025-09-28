import { test, expect } from "@playwright/test";

import { signInViaApi } from "../utils/auth";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await signInViaApi(page, { baseURL: baseURL ?? undefined });
  });

  test("today view renders core widgets", async ({ page }) => {
    await page.goto("/today");

    await expect(page.getByRole("heading", { name: "Daily focus" })).toBeVisible();
    await expect(page.getByText("Set the tone for the day")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Tap practices as you complete them/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Stoic Breathing Reset/ })).toBeVisible();
  });

  test("completing a practice toggles completion state", async ({ page }) => {
    await page.goto("/today");

    const practiceButton = page.getByRole("button", { name: /Stoic Breathing Reset/ });

    await expect(practiceButton.locator('svg[data-lucide="circle"]').first()).toBeVisible();
    await practiceButton.click();
    await expect(practiceButton.locator('svg[data-lucide="check-circle-2"]').first()).toBeVisible();
  });
});
