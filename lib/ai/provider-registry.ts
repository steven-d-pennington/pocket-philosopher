import type {
  AIChatProvider,
  AIEmbeddingProvider,
  AIProviderHealth,
  AIProviderStatus,
} from "@/lib/ai/types";
import { serverAnalytics } from "@/lib/analytics/server";
import {
  checkAnthropicHealth,
  createAnthropicChatStream,
} from "@/lib/ai/providers/anthropic";
import {
  checkOpenAIHealth,
  createOpenAIChatStream,
  createOpenAIEmbedding,
} from "@/lib/ai/providers/openai";
import {
  checkTogetherHealth,
  createTogetherChatStream,
  createTogetherEmbedding,
} from "@/lib/ai/providers/together";
import { checkOllamaHealth, createOllamaChatStream } from "@/lib/ai/providers/ollama";

const HEALTH_TTL_MS = 30_000;
const DISTINCT_ID = "ai-provider-registry";

type CachedHealth = {
  value: AIProviderHealth;
  expiresAt: number;
};

type ProviderWithHealth<T extends { id: string }> = T & {
  checkHealth: (signal?: AbortSignal) => Promise<AIProviderHealth>;
};

const chatProviders: AIChatProvider[] = [];
const embeddingProviders: AIEmbeddingProvider[] = [];
const healthCache = new Map<string, CachedHealth>();
const lastKnownStatus = new Map<string, AIProviderStatus | undefined>();

type ProviderRuntimeCounters = {
  successCount: number;
  failureCount: number;
  lastSuccessAt?: number;
  lastFailureAt?: number;
};

type ProviderHealthSnapshot = AIProviderHealth & {
  latencyMs: number;
  checkedAt: number;
};

type ProviderSelectionAttempt = {
  providerId: string;
  status: AIProviderStatus;
};

export type ProviderSelectionResult<T extends { id: string }> = {
  provider: T;
  health: AIProviderHealth;
  fallbackUsed: boolean;
  attempts: ProviderSelectionAttempt[];
};

const providerRuntimeCounters = new Map<string, ProviderRuntimeCounters>();
const providerHealthSnapshots = new Map<string, ProviderHealthSnapshot>();

let lastChatSelection: (ProviderSelectionResult<AIChatProvider> & { selectedAt: number }) | null = null;

function getRuntimeCounters(providerId: string): ProviderRuntimeCounters {
  let counters = providerRuntimeCounters.get(providerId);
  if (!counters) {
    counters = { successCount: 0, failureCount: 0 } satisfies ProviderRuntimeCounters;
    providerRuntimeCounters.set(providerId, counters);
  }
  return counters;
}

function orderProviders<T extends { priority: number; weight?: number }>(providers: T[]): T[] {
  return [...providers].sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    const weightA = typeof a.weight === "number" && a.weight > 0 ? a.weight : 1;
    const weightB = typeof b.weight === "number" && b.weight > 0 ? b.weight : 1;
    return weightB - weightA;
  });
}

async function evaluateHealth<T extends ProviderWithHealth<{ id: string }>>(
  provider: T,
  signal?: AbortSignal,
): Promise<AIProviderHealth> {
  const now = Date.now();
  const cached = healthCache.get(provider.id);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const startedAt = Date.now();
  let result: AIProviderHealth;
  try {
    result = await provider.checkHealth(signal);
  } catch (error) {
    result = {
      providerId: provider.id,
      status: "unavailable",
      latencyMs: Date.now() - startedAt,
      error: {
        message: error instanceof Error ? error.message : "Provider health check failed",
        code: error && typeof error === "object" && "code" in error ? String((error as { code?: unknown }).code) : undefined,
      },
      checkedAt: Date.now(),
    } satisfies AIProviderHealth;
  }

  const latencyMs = typeof result.latencyMs === "number" ? result.latencyMs : Date.now() - startedAt;
  const checkedAt = typeof result.checkedAt === "number" ? result.checkedAt : Date.now();

  if (result.providerId !== provider.id) {
    result = { ...result, providerId: provider.id } satisfies AIProviderHealth;
  }

  const normalizedResult = { ...result, latencyMs, checkedAt } satisfies ProviderHealthSnapshot;

  healthCache.set(provider.id, { value: normalizedResult, expiresAt: now + HEALTH_TTL_MS });
  providerHealthSnapshots.set(provider.id, normalizedResult);

  const previousStatus = lastKnownStatus.get(provider.id);
  lastKnownStatus.set(provider.id, normalizedResult.status);
  if (previousStatus && previousStatus !== normalizedResult.status) {
    serverAnalytics.capture({
      event: "i_provider_health_changed",
      distinctId: DISTINCT_ID,
      properties: {
        providerId: provider.id,
        previousStatus,
        currentStatus: normalizedResult.status,
        latencyMs: normalizedResult.latencyMs,
        checkedAt: normalizedResult.checkedAt,
        errorMessage: normalizedResult.error?.message,
        errorCode: normalizedResult.error?.code,
      },
    });
  }

  return normalizedResult;
}

async function selectProvider<
  T extends ProviderWithHealth<{ id: string; priority: number; weight?: number }>,
>(
  providers: T[],
  signal?: AbortSignal,
): Promise<ProviderSelectionResult<T> | null> {
  if (providers.length === 0) {
    return null;
  }

  const ordered = orderProviders(providers);
  const attempts: ProviderSelectionAttempt[] = [];
  let degradedCandidate: ProviderSelectionResult<T> | null = null;
  let fallback: ProviderSelectionResult<T> | null = null;

  for (const provider of ordered) {
    const health = await evaluateHealth(provider, signal);
    attempts.push({ providerId: provider.id, status: health.status });

    if (health.status === "healthy") {
      return {
        provider,
        health,
        fallbackUsed: false,
        attempts: [...attempts],
      } satisfies ProviderSelectionResult<T>;
    }

    if (health.status === "degraded" && !degradedCandidate) {
      degradedCandidate = {
        provider,
        health,
        fallbackUsed: true,
        attempts: [...attempts],
      } satisfies ProviderSelectionResult<T>;
    }

    if (!fallback) {
      fallback = {
        provider,
        health,
        fallbackUsed: true,
        attempts: [...attempts],
      } satisfies ProviderSelectionResult<T>;
    }
  }

  return degradedCandidate ?? fallback;
}

export function registerChatProvider(provider: AIChatProvider): void {
  const exists = chatProviders.some((item) => item.id === provider.id);
  if (!exists) {
    chatProviders.push(provider);
  }
}

export function registerEmbeddingProvider(provider: AIEmbeddingProvider): void {
  const exists = embeddingProviders.some((item) => item.id === provider.id);
  if (!exists) {
    embeddingProviders.push(provider);
  }
}

export async function getActiveChatProvider(
  signal?: AbortSignal,
): Promise<ProviderSelectionResult<AIChatProvider> | null> {
  const selection = await selectProvider(chatProviders, signal);
  if (selection) {
    lastChatSelection = { ...selection, selectedAt: Date.now() };
  }
  return selection;
}

export async function getActiveEmbeddingProvider(
  signal?: AbortSignal,
): Promise<ProviderSelectionResult<AIEmbeddingProvider> | null> {
  return selectProvider(embeddingProviders, signal);
}

export async function getProviderHealth(providerId: string, signal?: AbortSignal): Promise<AIProviderHealth | null> {
  const provider = chatProviders.find((item) => item.id === providerId) ??
    embeddingProviders.find((item) => item.id === providerId);
  if (!provider) {
    return null;
  }

  return evaluateHealth(provider, signal);
}

interface ProviderFailureOptions {
  durationMs?: number;
  errorCode?: string;
  metadata?: Record<string, unknown>;
}

export function recordProviderFailure(
  providerId: string,
  error: unknown,
  options: ProviderFailureOptions = {},
): void {
  const message = error instanceof Error ? error.message : String(error);
  const inferredCode =
    options.errorCode ??
    (error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code)
      : undefined);

  const counters = getRuntimeCounters(providerId);
  counters.failureCount += 1;
  counters.lastFailureAt = Date.now();

  serverAnalytics.capture({
    event: "i_request_failed",
    distinctId: DISTINCT_ID,
    properties: {
      providerId,
      message,
      durationMs: options.durationMs,
      errorCode: inferredCode,
      ...options.metadata,
    },
  });
}

export function recordProviderSuccess(providerId: string): void {
  const counters = getRuntimeCounters(providerId);
  counters.successCount += 1;
  counters.lastSuccessAt = Date.now();
}

export function getChatProviderDiagnostics() {
  const diagnostics = Object.fromEntries(
    chatProviders.map((provider) => {
      const counters = getRuntimeCounters(provider.id);
      const health = providerHealthSnapshots.get(provider.id);
      return [
        provider.id,
        {
          status: health?.status,
          checkedAt: health?.checkedAt,
          latencyMs: health?.latencyMs,
          error: health?.error ?? null,
          successCount: counters.successCount,
          failureCount: counters.failureCount,
          lastSuccessAt: counters.lastSuccessAt,
          lastFailureAt: counters.lastFailureAt,
        },
      ];
    }),
  );

  return {
    providers: diagnostics,
    lastSelected: lastChatSelection
      ? {
          providerId: lastChatSelection.provider.id,
          status: lastChatSelection.health.status,
          fallbackUsed: lastChatSelection.fallbackUsed,
          selectedAt: lastChatSelection.selectedAt,
        }
      : null,
  };
}

function bootstrap(): void {
  registerChatProvider({
    id: "openai",
    displayName: "OpenAI",
    priority: 1,
    weight: 2,
    createChatStream: createOpenAIChatStream,
    checkHealth: checkOpenAIHealth,
  });

  registerChatProvider({
    id: "anthropic",
    displayName: "Anthropic",
    priority: 2,
    weight: 1,
    createChatStream: createAnthropicChatStream,
    checkHealth: checkAnthropicHealth,
  });

  registerChatProvider({
    id: "together",
    displayName: "Together AI",
    priority: 3,
    weight: 1,
    createChatStream: createTogetherChatStream,
    checkHealth: checkTogetherHealth,
  });

  registerChatProvider({
    id: "ollama",
    displayName: "Ollama",
    priority: 4,
    weight: 1,
    createChatStream: createOllamaChatStream,
    checkHealth: checkOllamaHealth,
  });

  registerEmbeddingProvider({
    id: "openai",
    displayName: "OpenAI",
    priority: 1,
    weight: 2,
    createEmbedding: createOpenAIEmbedding,
    checkHealth: checkOpenAIHealth,
  });

  registerEmbeddingProvider({
    id: "together",
    displayName: "Together AI",
    priority: 2,
    weight: 1,
    createEmbedding: createTogetherEmbedding,
    checkHealth: checkTogetherHealth,
  });
}

bootstrap();
