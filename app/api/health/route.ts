import { error, success } from "@/app/api/_lib/response";
import { createRequestLogger } from "@/lib/logging/logger";
import { serverAnalytics } from "@/lib/analytics/server";
import { env } from "@/lib/env-validation";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import {
  getChatProviderDiagnostics,
  getProviderStatistics,
} from "@/lib/ai/provider-registry";

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
  const providerStatistics = getProviderStatistics();
  const providerStats = Object.fromEntries(
    providerStatistics.map((stat) => {
      const diagnostics = providerDiagnostics.providers[stat.providerId];
      const lastCheckedAt = stat.lastCheckedAt ? new Date(stat.lastCheckedAt).toISOString() : null;
      const payload = {
        status: stat.status,
        lastCheckedAt,
        latencyMs: stat.lastLatencyMs,
        successCount: stat.successes,
        failureCount: stat.failures,
        degradedCount: stat.degraded,
        lastSuccessAt: diagnostics?.lastSuccessAt
          ? new Date(diagnostics.lastSuccessAt).toISOString()
          : null,
        lastFailureAt: diagnostics?.lastFailureAt
          ? new Date(diagnostics.lastFailureAt).toISOString()
          : null,
        error: diagnostics?.error ?? null,
      } as const;

      const logDetails = {
        providerId: stat.providerId,
        ...payload,
      };
      if (stat.status === "degraded" || stat.status === "unavailable") {
        logger.warn("Provider health degraded", logDetails);
      } else {
        logger.info("Provider health status", logDetails);
      }

      return [stat.providerId, payload] as const;
    }),
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

