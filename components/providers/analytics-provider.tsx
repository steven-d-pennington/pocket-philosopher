"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";

import { clientEnv } from "@/lib/env-validation";

const DEFAULT_POSTHOG_HOST = "https://app.posthog.com";

let isInitialized = false;

const initializePosthog = () => {
  if (isInitialized) return;
  if (typeof window === "undefined") return;
  const projectKey = clientEnv.NEXT_PUBLIC_POSTHOG_KEY;
  if (!projectKey) return;

  posthog.init(projectKey, {
    api_host: clientEnv.NEXT_PUBLIC_POSTHOG_HOST ?? DEFAULT_POSTHOG_HOST,
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: true,
  });

  if (process.env.NODE_ENV === "development") {
    posthog.debug();
  }

  isInitialized = true;
};

const capturePageView = (url: string) => {
  if (!isInitialized) return;
  posthog.capture("$pageview", {
    $current_url: url,
  });
};

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString();

  useEffect(() => {
    initializePosthog();
  }, []);

  useEffect(() => {
    if (!clientEnv.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (typeof window === "undefined") return;

    const fullPath = search ? `${pathname}?${search}` : pathname;
    capturePageView(`${window.location.origin}${fullPath}`);
  }, [pathname, search]);

  return children;
}
