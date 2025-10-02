import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client with service role key for admin operations.
 * This client has elevated privileges and should only be used in admin API routes.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
