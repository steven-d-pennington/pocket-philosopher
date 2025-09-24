import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export interface RouteContext {
  supabase: SupabaseClient<Database>;
  user: {
    id: string;
    email?: string;
  } | null;
}

export async function createRouteContext(): Promise<RouteContext> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    supabase,
    user: user
      ? {
          id: user.id,
          email: user.email ?? undefined,
        }
      : null,
  };
}
