import { cookies } from "next/headers";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/lib/env-validation";
import type { Database } from "@/lib/supabase/types";

export async function createSupabaseServerClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Silently fail when called from Server Components (cookies can only be modified in Server Actions/Route Handlers)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({ name, ...options });
          } catch {
            // Silently fail when called from Server Components (cookies can only be modified in Server Actions/Route Handlers)
          }
        },
      },
    },
  );
}

export async function createSupabaseServiceClient(): Promise<SupabaseClient<Database>> {
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required for admin operations');
  }

  // Service role client that bypasses RLS
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey,
    {
      cookies: {
        get() {
          return undefined;
        },
        set() {
          // No-op
        },
        remove() {
          // No-op
        },
      },
    },
  );
}
