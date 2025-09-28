import { PostHog } from "posthog-node";

import { env } from "@/lib/env-validation";

type PostHogPropertyValue = string | number;

type CaptureOptions = {
  event: string;
  distinctId: string;
  properties?: Record<string, unknown>;
  groups?: Record<string, unknown>;
};

type IdentifyOptions = {
  distinctId: string;
  properties?: Record<string, unknown>;
};

const host = env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

const posthogClient = env.POSTHOG_API_KEY
  ? new PostHog(env.POSTHOG_API_KEY, {
      host,
      flushAt: 1,
      flushInterval: 1000,
    })
  : undefined;

const warn = (message: string, error: unknown) => {
  if (process.env.NODE_ENV !== "production") {
    console.warn(message, error);
  }
};

function normalizeProperties(input?: Record<string, unknown>): Record<string, PostHogPropertyValue> | undefined {
  if (!input) return undefined;
  const result: Record<string, PostHogPropertyValue> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value == null) {
      continue;
    }
    if (typeof value === "string" || typeof value === "number") {
      result[key] = value;
      continue;
    }
    if (typeof value === "boolean") {
      result[key] = value ? 1 : 0;
      continue;
    }
    try {
      result[key] = JSON.stringify(value);
    } catch {
      result[key] = String(value);
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

export const serverAnalytics = {
  isEnabled: Boolean(posthogClient),
  capture({ event, distinctId, properties, groups }: CaptureOptions) {
    if (!posthogClient) return;

    try {
      posthogClient.capture({
        distinctId,
        event,
        properties: normalizeProperties(properties),
        groups: normalizeProperties(groups),
      });
    } catch (error) {
      warn(`PostHog capture failed for ${event}`, error);
    }
  },
  identify({ distinctId, properties }: IdentifyOptions) {
    if (!posthogClient) return;

    try {
      posthogClient.identify({
        distinctId,
        properties: normalizeProperties(properties),
      });
    } catch (error) {
      warn(`PostHog identify failed for ${distinctId}`, error);
    }
  },
  async flush() {
    if (!posthogClient) return;

    const client = posthogClient as unknown as { flush?: () => Promise<void> | void };
    const flushFn = client.flush;
    if (typeof flushFn === "function") {
      try {
        await Promise.resolve(flushFn.call(posthogClient));
      } catch (error) {
        warn("PostHog flush failed", error);
      }
    }
  },
  async shutdown() {
    if (!posthogClient) return;

    const client = posthogClient as unknown as { shutdown?: (timeout?: number) => Promise<void> | void };
    const shutdownFn = client.shutdown;
    if (typeof shutdownFn === "function") {
      try {
        await Promise.resolve(shutdownFn.call(posthogClient));
      } catch (error) {
        warn("PostHog shutdown failed", error);
      }
    }
  },
};

