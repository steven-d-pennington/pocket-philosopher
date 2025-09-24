"use client";

import { useMemo } from "react";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { clientEnv } from "@/lib/env-validation";
import type { Database } from "@/lib/supabase/types";

let browserClient: SupabaseClient<Database> | null = null;

export function useSupabaseBrowser() {
  return useMemo(() => {
    if (!browserClient) {
      browserClient = createBrowserClient<Database>(
        clientEnv.NEXT_PUBLIC_SUPABASE_URL,
        clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      );
    }
    return browserClient;
  }, []);
}
