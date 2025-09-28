import { error, success } from "@/app/api/_lib/response";
import { createRequestLogger } from "@/lib/logging/logger";
import { serverAnalytics } from "@/lib/analytics/server";
import { env } from "@/lib/env-validation";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import { getChatProviderDiagnostics } from "@/lib/ai/provider-registry";

const ROUTE = "/api/health";

export async function GET(request: Request) {
  const logger = createRequestLogger({ request, route: ROUTE });

  let supabase;
  try {
    supabase = getSupabaseServiceRoleClient();
  } catch (err) {
    logger.error("Service role client unavailable", err);
    return error("Service role client unavailable", {
      status: 500,
      details: { message: err instanceof Error ? err.message : String(err) },
      requestId: logger.requestId,
    });
  }

  const startedAt = Date.now();
  const { error: dbError } = await supabase.from("profiles").select("user_id").limit(1);
  const supabaseLatency = (Date.now() - startedAt);

  const providerDiagnostics = getChatProviderDiagnostics();
  const providerStats = Object.fromEntries(
    Object.entries(providerDiagnostics.providers).map(([providerId, stats]) => [
      providerId,
      {
        status: stats.status ?? "unknown",
        lastCheckedAt: stats.checkedAt ? new Date(stats.checkedAt).toISOString() : null,
        latencyMs: stats.latencyMs ?? null,
        error: stats.error ?? null,
        successCount: stats.successCount,
        failureCount: stats.failureCount,
        lastSuccessAt: stats.lastSuccessAt ? new Date(stats.lastSuccessAt).toISOString() : null,
        lastFailureAt: stats.lastFailureAt ? new Date(stats.lastFailureAt).toISOString() : null,
      },
    ]),
  );

  const lastSelected = providerDiagnostics.lastSelected
    ? {
        providerId: providerDiagnostics.lastSelected.providerId,
        providerStatus: providerDiagnostics.lastSelected.status,
        fallbackUsed: providerDiagnostics.lastSelected.fallbackUsed,
        selectedAt: new Date(providerDiagnostics.lastSelected.selectedAt).toISOString(),
      }
    : null;

  const dependencies = {
    supabase: {
      status: dbError ? "error" : "ok",
      latencyMs: supabaseLatency,
      message: dbError?.message ?? null,
    },
    analytics: {
      status: serverAnalytics.isEnabled ? "ok" : "disabled",
    },
    aiProviders: {
      configuration: {
        openai: env.OPENAI_API_KEY ? "configured" : "missing",
        anthropic: env.ANTHROPIC_API_KEY ? "configured" : "missing",
        together: env.TOGETHER_API_KEY ? "configured" : "missing",
        ollama: env.OLLAMA_URL ? "configured" : "missing",
      },
      selection: lastSelected,
      stats: providerStats,
    },
  } as const;

  const payload = {
    status: dbError ? "degraded" : "ok",
    timestamp: new Date().toISOString(),
    dependencies,
  };

  if (dbError) {
    logger.error("Health check database probe failed", dbError, { dependency: "supabase" });
    return error("Health check failed", {
      status: 503,
      details: payload,
      requestId: logger.requestId,
    });
  }

  logger.info("Health check succeeded", { dependencies });
  return success(payload, { requestId: logger.requestId });
}

