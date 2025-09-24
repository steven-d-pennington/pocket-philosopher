import { env, clientEnv } from "@/lib/env-validation";

import { error, success } from "@/app/api/_lib/response";
import { createRouteContext } from "@/app/api/_lib/supabase-route";

export async function GET() {
  const { user } = await createRouteContext();

  if (!user) {
    return error("Unauthorized", { status: 401 });
  }

  const payload = {
    environment: env.NODE_ENV,
    supabaseUrl: clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    analyticsConfigured: Boolean(env.POSTHOG_API_KEY),
    hasServiceRoleKey: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
  };

  return success(payload);
}
