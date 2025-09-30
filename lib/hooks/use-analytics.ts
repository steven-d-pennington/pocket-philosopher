"use client";

import { useCallback } from "react";
import posthog from "posthog-js";

import { clientEnv } from "@/lib/env-validation";

const isEnabled = Boolean(clientEnv.NEXT_PUBLIC_POSTHOG_KEY);

export function useAnalytics() {
  const capture = useCallback(
    (event: string, properties?: Record<string, unknown>) => {
      if (!isEnabled) return;

      // Add performance monitoring for response times
      if (event.includes("response") || event.includes("streaming")) {
        const duration = properties?.duration as number;
        if (duration) {
          // Track performance metrics
          posthog.capture("performance_metric", {
            metric: event,
            duration,
            timestamp: Date.now(),
          });
        }
      }

      posthog.capture(event, properties);
    },
    [],
  );

  const identify = useCallback(
    (id: string, properties?: Record<string, unknown>) => {
      if (!isEnabled) return;
      posthog.identify(id, properties);
    },
    [],
  );

  const reset = useCallback(() => {
    if (!isEnabled) return;
    posthog.reset();
  }, []);

  return {
    isEnabled,
    capture,
    identify,
    reset,
  };
}

