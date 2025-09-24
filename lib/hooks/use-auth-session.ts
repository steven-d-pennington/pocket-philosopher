"use client";

import { useEffect, useState } from "react";

import type { Session } from "@supabase/supabase-js";

import { selectAuthActions, useAuthStore } from "@/lib/stores/auth-store";

import { useSupabaseBrowser } from "./use-supabase-browser";

interface UseAuthSessionResult {
  session: Session | null;
  initialized: boolean;
}

export function useAuthSession(): UseAuthSessionResult {
  const supabase = useSupabaseBrowser();
  const actions = useAuthStore(selectAuthActions);
  const session = useAuthStore((state) => state.session);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let active = true;
    actions.setStatus("loading");

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        actions.hydrate({ session: data.session ?? null, profile: null });
        setInitialized(true);
      })
      .catch((error) => {
        if (!active) return;
        actions.setStatus("unauthenticated");
        actions.setProfile(null);
        console.error("Failed to load Supabase session", error);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      actions.setSession(nextSession);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [actions, supabase]);

  return { session, initialized };
}
