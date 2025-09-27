import { PostHog } from "posthog-node";

import { env } from "@/lib/env-validation";

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

export const serverAnalytics = {
  isEnabled: Boolean(posthogClient),
  capture({ event, distinctId, properties, groups }: CaptureOptions) {
    if (!posthogClient) return;

    posthogClient
      .capture({
        distinctId,
        event,
        properties,
        groups,
      })
      .catch((error) => warn(`PostHog capture failed for ${event}`, error));
  },
  identify({ distinctId, properties }: IdentifyOptions) {
    if (!posthogClient) return;

    posthogClient
      .identify({
        distinctId,
        properties,
      })
      .catch((error) => warn(`PostHog identify failed for ${distinctId}`, error));
  },
  async flush() {
    if (!posthogClient) return;

    await new Promise<void>((resolve) => {
      posthogClient.flush((error) => {
        if (error) {
          warn("PostHog flush failed", error);
        }
        resolve();
      });
    });
  },
  async shutdown() {
    if (!posthogClient) return;

    await new Promise<void>((resolve) => {
      posthogClient.shutdown((error) => {
        if (error) {
          warn("PostHog shutdown failed", error);
        }
        resolve();
      });
    });
  },
};
