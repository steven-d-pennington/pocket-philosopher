import { request, type Page, type BrowserContext } from "@playwright/test";

import { getTestUser } from "./test-users";

function resolveBaseURL(baseURL?: string) {
  if (baseURL) return baseURL;
  if (process.env.PLAYWRIGHT_BASE_URL) return process.env.PLAYWRIGHT_BASE_URL;
  return "http://127.0.0.1:3000";
}

export async function signInViaApi(page: Page, options?: { baseURL?: string }) {
  const targetBaseURL = resolveBaseURL(options?.baseURL);
  const user = getTestUser("primary");

  const requestContext = await request.newContext({
    baseURL: targetBaseURL,
    extraHTTPHeaders: {
      "Content-Type": "application/json",
    },
  });

  const response = await requestContext.post("/api/auth", {
    data: {
      action: "signIn",
      email: user.email,
      password: user.password,
    },
  });

  if (!response.ok()) {
    const body = await response.text();
    await requestContext.dispose();
    throw new Error(`Failed to authenticate test user. Status: ${response.status()} Body: ${body}`);
  }

  const storageState = await requestContext.storageState();
  await requestContext.dispose();

  const url = new URL(targetBaseURL);

  type CookieParam = Parameters<BrowserContext["addCookies"]>[0][number];

  const cookies: CookieParam[] = storageState.cookies.map((cookie) => ({
    ...cookie,
    domain: cookie.domain ?? url.hostname,
    path: cookie.path ?? "/",
  }));

  await page.context().addCookies(cookies);
}
