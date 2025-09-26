"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";

import { clientEnv } from "@/lib/env-validation";
import {
  selectAuthProfile,
  selectAuthSession,
  useAuthStore,
} from "@/lib/stores/auth-store";

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
  const session = useAuthStore(selectAuthSession);
  const profile = useAuthStore(selectAuthProfile);
  const identifiedRef = useRef<string | null>(null);

  useEffect(() => {
    initializePosthog();
  }, []);

  useEffect(() => {
    if (!clientEnv.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (typeof window === "undefined") return;

    const fullPath = search ? `${pathname}?${search}` : pathname;
    capturePageView(`${window.location.origin}${fullPath}`);
  }, [pathname, search]);

  useEffect(() => {
    if (!clientEnv.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (!isInitialized) return;

    const userId = session?.user?.id ?? null;

    if (!userId) {
      if (identifiedRef.current) {
        posthog.reset();
        identifiedRef.current = null;
      }
      return;
    }

    const traits: Record<string, unknown> = {};
    const email = session?.user?.email ?? profile?.email;
    if (email) traits.email = email;
    if (profile?.displayName) traits.name = profile.displayName;
    if (profile?.preferred_virtue) traits.preferred_virtue = profile.preferred_virtue;
    if (profile?.preferred_persona) traits.preferred_persona = profile.preferred_persona;
    if (profile?.timezone) traits.timezone = profile.timezone;

    posthog.identify(userId, traits);
    identifiedRef.current = userId;
  }, [profile?.displayName, profile?.preferred_persona, profile?.preferred_virtue, profile?.timezone, session?.user?.email, session?.user?.id, profile?.email]);

  return children;
}
