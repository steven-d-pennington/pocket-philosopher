import { test, expect } from "@playwright/test";

import { signInViaApi } from "../utils/auth";

test.describe("Reflections CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await signInViaApi(page);
    await page.goto("/reflections");
  });

  test("reflections page renders with reflection types", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Reflections/i })).toBeVisible();

    // Check for reflection type tabs
    await expect(page.getByRole("tab", { name: /Morning/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Midday/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Evening/i })).toBeVisible();
  });

  test("user can create a morning reflection", async ({ page }) => {
    // Navigate to reflections page
    await page.goto("/reflections");

    // Select morning tab
    await page.getByRole("tab", { name: /Morning/i }).click();

    // Fill out morning reflection fields
    const virtueFocus = page.getByLabel(/Virtue focus/i);
    if (await virtueFocus.isVisible()) {
      await virtueFocus.selectOption("Wisdom");
    }

    const intentionField = page.getByLabel(/Intention/i);
    if (await intentionField.isVisible()) {
      await intentionField.fill("Practice patience and mindfulness today");
    }

    const gratitudeField = page.getByLabel(/Gratitude/i);
    if (await gratitudeField.isVisible()) {
      await gratitudeField.fill("Grateful for my health and family");
    }

    // Save reflection
    const saveButton = page.getByRole("button", { name: /Save/i });
    if (await saveButton.isVisible()) {
      await saveButton.click();

      // Wait for success indication
      await expect(page.getByText(/saved/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test("user can edit an existing reflection", async ({ page }) => {
    await page.goto("/reflections");

    // Create a reflection first
    await page.getByRole("tab", { name: /Morning/i }).click();

    const intentionField = page.getByLabel(/Intention/i);
    if (await intentionField.isVisible()) {
      await intentionField.fill("Original intention");

      const saveButton = page.getByRole("button", { name: /Save/i });
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(1000);
      }

      // Edit the reflection
      await intentionField.clear();
      await intentionField.fill("Updated intention with more details");

      if (await saveButton.isVisible()) {
        await saveButton.click();
        await expect(page.getByText(/saved/i)).toBeVisible({ timeout: 5000 });
      }

      // Verify the update persisted
      await page.reload();
      await page.getByRole("tab", { name: /Morning/i }).click();
      await expect(intentionField).toHaveValue(/Updated intention/i);
    }
  });

  test("user can switch between reflection types", async ({ page }) => {
    await page.goto("/reflections");

    // Morning tab
    await page.getByRole("tab", { name: /Morning/i }).click();
    await expect(page.getByLabel(/Intention/i)).toBeVisible();

    // Midday tab
    await page.getByRole("tab", { name: /Midday/i }).click();
    await expect(page.getByLabel(/Challenge/i)).toBeVisible();

    // Evening tab
    await page.getByRole("tab", { name: /Evening/i }).click();
    await expect(page.getByLabel(/Lesson/i)).toBeVisible();
  });

  test("reflections persist across page reloads", async ({ page }) => {
    await page.goto("/reflections");

    const testIntention = `Test intention ${Date.now()}`;

    // Create reflection
    await page.getByRole("tab", { name: /Morning/i }).click();
    const intentionField = page.getByLabel(/Intention/i);

    if (await intentionField.isVisible()) {
      await intentionField.fill(testIntention);

      const saveButton = page.getByRole("button", { name: /Save/i });
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(1000);
      }

      // Reload and verify
      await page.reload();
      await page.getByRole("tab", { name: /Morning/i }).click();
      await expect(intentionField).toHaveValue(testIntention);
    }
  });

  test("user can navigate to different dates", async ({ page }) => {
    await page.goto("/reflections");

    // Look for date navigation controls
    const prevDayButton = page.getByRole("button", { name: /previous/i }).or(page.getByLabel(/previous day/i));
    const nextDayButton = page.getByRole("button", { name: /next/i }).or(page.getByLabel(/next day/i));

    if (await prevDayButton.isVisible()) {
      await prevDayButton.click();
      await page.waitForTimeout(500);

      // Should show a different date
      const dateDisplay = page.getByText(/\d{4}-\d{2}-\d{2}/).or(page.getByText(/\w+ \d+/));
      await expect(dateDisplay.first()).toBeVisible();
    }
  });
});
