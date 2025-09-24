import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/lib/env-validation";
import type { Database } from "@/lib/supabase/types";

let adminClient: SupabaseClient<Database> | null = null;

export function getSupabaseServiceRoleClient(): SupabaseClient<Database> {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set. Update your environment configuration.");
  }

  if (!adminClient) {
    adminClient = createClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
  }

  return adminClient;
}
