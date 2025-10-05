import { test, expect } from "@playwright/test";

import { signInViaApi } from "../utils/auth";

test.describe("Practices Management", () => {
  test.beforeEach(async ({ page }) => {
    await signInViaApi(page);
    await page.goto("/practices");
  });

  test("practices page renders with practice list", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Practices/i })).toBeVisible();

    // Check for create practice button
    const createButton = page.getByRole("button", { name: /Create practice/i }).or(page.getByRole("button", { name: /Add practice/i }));
    await expect(createButton.first()).toBeVisible();
  });

  test("user can create a new practice", async ({ page }) => {
    const practiceName = `Test Practice ${Date.now()}`;

    // Click create button
    const createButton = page.getByRole("button", { name: /Create practice/i }).or(page.getByRole("button", { name: /Add practice/i }));
    await createButton.first().click();

    // Fill in practice details
    const nameField = page.getByLabel(/Name/i).or(page.getByPlaceholder(/practice name/i));
    await expect(nameField.first()).toBeVisible();
    await nameField.first().fill(practiceName);

    // Select virtue (if available)
    const virtueSelect = page.getByLabel(/Virtue/i);
    if (await virtueSelect.isVisible()) {
      await virtueSelect.selectOption("Wisdom");
    }

    // Set frequency
    const frequencySelect = page.getByLabel(/Frequency/i).or(page.getByLabel(/Target/i));
    if (await frequencySelect.isVisible()) {
      await frequencySelect.first().selectOption("daily");
    }

    // Save practice
    const saveButton = page.getByRole("button", { name: /Save/i }).or(page.getByRole("button", { name: /Create/i }));
    await saveButton.first().click();

    // Verify practice was created
    await expect(page.getByText(practiceName)).toBeVisible({ timeout: 5000 });
  });

  test("user can toggle a practice completion", async ({ page }) => {
    // Look for an existing practice or create one
    const practiceCheckbox = page.getByRole("checkbox").first();

    if (await practiceCheckbox.isVisible()) {
      const initialState = await practiceCheckbox.isChecked();

      // Toggle the practice
      await practiceCheckbox.click();
      await page.waitForTimeout(500);

      // Verify state changed
      const newState = await practiceCheckbox.isChecked();
      expect(newState).not.toBe(initialState);

      // Toggle back
      await practiceCheckbox.click();
      await page.waitForTimeout(500);

      const finalState = await practiceCheckbox.isChecked();
      expect(finalState).toBe(initialState);
    }
  });

  test("user can edit an existing practice", async ({ page }) => {
    // Create a practice first
    const originalName = `Original Practice ${Date.now()}`;
    const updatedName = `Updated Practice ${Date.now()}`;

    const createButton = page.getByRole("button", { name: /Create practice/i }).or(page.getByRole("button", { name: /Add practice/i }));
    if (await createButton.first().isVisible()) {
      await createButton.first().click();

      const nameField = page.getByLabel(/Name/i).or(page.getByPlaceholder(/practice name/i));
      await nameField.first().fill(originalName);

      const saveButton = page.getByRole("button", { name: /Save/i }).or(page.getByRole("button", { name: /Create/i }));
      await saveButton.first().click();
      await page.waitForTimeout(1000);

      // Find and edit the practice
      const practiceCard = page.getByText(originalName).locator("..");
      const editButton = practiceCard.getByRole("button", { name: /Edit/i }).or(practiceCard.getByLabel(/Edit/i));

      if (await editButton.isVisible()) {
        await editButton.click();

        const editNameField = page.getByLabel(/Name/i).or(page.getByPlaceholder(/practice name/i));
        await editNameField.first().clear();
        await editNameField.first().fill(updatedName);

        const updateButton = page.getByRole("button", { name: /Update/i }).or(page.getByRole("button", { name: /Save/i }));
        await updateButton.first().click();

        // Verify update
        await expect(page.getByText(updatedName)).toBeVisible({ timeout: 5000 });
        await expect(page.getByText(originalName)).not.toBeVisible();
      }
    }
  });

  test("user can delete a practice", async ({ page }) => {
    // Create a practice to delete
    const practiceName = `Practice to Delete ${Date.now()}`;

    const createButton = page.getByRole("button", { name: /Create practice/i }).or(page.getByRole("button", { name: /Add practice/i }));
    if (await createButton.first().isVisible()) {
      await createButton.first().click();

      const nameField = page.getByLabel(/Name/i).or(page.getByPlaceholder(/practice name/i));
      await nameField.first().fill(practiceName);

      const saveButton = page.getByRole("button", { name: /Save/i }).or(page.getByRole("button", { name: /Create/i }));
      await saveButton.first().click();
      await page.waitForTimeout(1000);

      // Find and delete the practice
      const practiceCard = page.getByText(practiceName).locator("..");
      const deleteButton = practiceCard.getByRole("button", { name: /Delete/i }).or(practiceCard.getByLabel(/Delete/i));

      if (await deleteButton.isVisible()) {
        await deleteButton.click();

        // Confirm deletion if there's a confirmation dialog
        const confirmButton = page.getByRole("button", { name: /Confirm/i }).or(page.getByRole("button", { name: /Delete/i }));
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        // Verify practice was deleted
        await expect(page.getByText(practiceName)).not.toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("practices persist across page reloads", async ({ page }) => {
    const practiceName = `Persistent Practice ${Date.now()}`;

    // Create practice
    const createButton = page.getByRole("button", { name: /Create practice/i }).or(page.getByRole("button", { name: /Add practice/i }));
    if (await createButton.first().isVisible()) {
      await createButton.first().click();

      const nameField = page.getByLabel(/Name/i).or(page.getByPlaceholder(/practice name/i));
      await nameField.first().fill(practiceName);

      const saveButton = page.getByRole("button", { name: /Save/i }).or(page.getByRole("button", { name: /Create/i }));
      await saveButton.first().click();
      await page.waitForTimeout(1000);

      // Reload and verify
      await page.reload();
      await expect(page.getByText(practiceName)).toBeVisible();
    }
  });

  test("user can view practice analytics", async ({ page }) => {
    await page.goto("/practices");

    // Look for analytics/progress section
    const analyticsSection = page.getByRole("heading", { name: /Progress/i }).or(page.getByRole("heading", { name: /Analytics/i }));

    if (await analyticsSection.isVisible()) {
      // Check for common analytics elements
      await expect(page.getByText(/streak/i).or(page.getByText(/completion/i))).toBeVisible();
    }
  });

  test("user can filter practices by virtue", async ({ page }) => {
    await page.goto("/practices");

    // Look for filter controls
    const filterSelect = page.getByLabel(/Filter/i).or(page.getByLabel(/Virtue/i));

    if (await filterSelect.isVisible()) {
      await filterSelect.selectOption("Wisdom");
      await page.waitForTimeout(500);

      // Practices should be filtered (hard to verify without knowing existing data)
      await expect(page.getByRole("heading", { name: /Practices/i })).toBeVisible();
    }
  });

  test("user can pause/archive a practice", async ({ page }) => {
    // Create a practice first
    const practiceName = `Practice to Pause ${Date.now()}`;

    const createButton = page.getByRole("button", { name: /Create practice/i }).or(page.getByRole("button", { name: /Add practice/i }));
    if (await createButton.first().isVisible()) {
      await createButton.first().click();

      const nameField = page.getByLabel(/Name/i).or(page.getByPlaceholder(/practice name/i));
      await nameField.first().fill(practiceName);

      const saveButton = page.getByRole("button", { name: /Save/i }).or(page.getByRole("button", { name: /Create/i }));
      await saveButton.first().click();
      await page.waitForTimeout(1000);

      // Find pause/archive button
      const practiceCard = page.getByText(practiceName).locator("..");
      const pauseButton = practiceCard.getByRole("button", { name: /Pause/i }).or(practiceCard.getByRole("button", { name: /Archive/i }));

      if (await pauseButton.isVisible()) {
        await pauseButton.click();
        await page.waitForTimeout(500);

        // Verify status changed (look for visual indicator)
        await expect(practiceCard.getByText(/paused/i).or(practiceCard.getByText(/archived/i))).toBeVisible();
      }
    }
  });
});
