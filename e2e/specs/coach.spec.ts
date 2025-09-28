import { test, expect } from "@playwright/test";

import { signInViaApi } from "../utils/auth";

const MOCK_CONVERSATION_ID = "11111111-2222-3333-4444-555555555555";
const MOCK_MESSAGE_ID = "99999999-8888-7777-6666-555555555555";

test.describe("Marcus coach", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await signInViaApi(page, { baseURL: baseURL ?? undefined });
  });

  test("streams a mocked coaching response", async ({ page }) => {
    await page.route("**/api/marcus", async (route, request) => {
      if (request.method() !== "POST") {
        await route.fallback();
        return;
      }

      const body = [
        `event: start`,
        `data: ${JSON.stringify({ conversation_id: MOCK_CONVERSATION_ID, message_id: MOCK_MESSAGE_ID })}`,
        "",
        `event: chunk`,
        `data: ${JSON.stringify({ delta: "Begin with a slow inhale." })}`,
        "",
        `event: chunk`,
        `data: ${JSON.stringify({ delta: " Exhale tension and return to the present." })}`,
        "",
        `event: complete`,
        `data: ${JSON.stringify({ tokens: 42 })}`,
        "",
      ].join("\n");

      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
        body,
      });
    });

    await page.goto("/marcus");

    await expect(page.getByRole("heading", { name: /Choose your guide/ })).toBeVisible();

    const composer = page.getByPlaceholder("Ask a question or share a reflection…");
    await composer.fill("How can I stay present during a busy day?");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("How can I stay present during a busy day?", { exact: false })).toBeVisible();
    await expect(
      page.getByText("Begin with a slow inhale. Exhale tension and return to the present.", { exact: false }),
    ).toBeVisible();
  });
});
