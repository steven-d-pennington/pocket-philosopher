import { test, expect } from "@playwright/test";

import { getTestUser } from "../utils/test-users";

const testUser = getTestUser("primary");

test.describe("Auth flows", () => {
  test("login page renders sign-in form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });

  test("user can sign in with seeded credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill(testUser.email);
    await page.getByLabel("Password").fill(testUser.password);
    await page.getByRole("button", { name: "Sign In" }).click();

    await page.waitForURL("**/today");

    await expect(page.getByRole("heading", { name: "Daily focus" })).toBeVisible();
    await expect(page.getByText("Set the tone for the day")).toBeVisible();
  });

  test("protected routes redirect unauthenticated visitors", async ({ page }) => {
    await page.goto("/today");
    await page.waitForURL("**/login");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });
});
