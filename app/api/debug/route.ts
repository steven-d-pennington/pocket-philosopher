import { clientEnv, env } from "@/lib/env-validation";

import {
  createApiRequestLogger,
  respondWithError,
  respondWithSuccess,
  withUserContext,
} from "@/app/api/_lib/logger";
import { createRouteContext } from "@/app/api/_lib/supabase-route";

const ROUTE = "/api/debug";

export async function GET(request: Request) {
  const baseLogger = createApiRequestLogger(request, ROUTE);
  const { user } = await createRouteContext();
  const logger = withUserContext(baseLogger, user?.id);

  if (!user) {
    logger.warn("Unauthorized access to debug endpoint");
    return respondWithError(logger, "Unauthorized", { status: 401 });
  }

  const payload = {
    environment: env.NODE_ENV,
    supabaseUrl: clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    analyticsConfigured: Boolean(env.POSTHOG_API_KEY),
    hasServiceRoleKey: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
  };

  logger.info("Debug status retrieved");
  return respondWithSuccess(logger, payload);
}
