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

  let result: AIProviderHealth;
  try {
    result = await provider.checkHealth(signal);
  } catch (error) {
    result = {
      providerId: provider.id,
      status: "unavailable",
      error: {
        message: error instanceof Error ? error.message : "Provider health check failed",
      },
      checkedAt: Date.now(),
    } satisfies AIProviderHealth;
  }


  if (result.providerId !== provider.id) {
    result = { ...result, providerId: provider.id } satisfies AIProviderHealth;
  }

  healthCache.set(provider.id, { value: result, expiresAt: now + HEALTH_TTL_MS });

  const previousStatus = lastKnownStatus.get(provider.id);
  lastKnownStatus.set(provider.id, result.status);
  if (previousStatus && previousStatus !== result.status) {
    serverAnalytics.capture({
      event: "ai_provider_health_changed",
      distinctId: DISTINCT_ID,
      properties: {
        providerId: provider.id,
        previousStatus,
        currentStatus: result.status,
        latencyMs: result.latencyMs,
        error: result.error?.message,
      },
    });
  }

  return result;
}

async function selectProvider<T extends ProviderWithHealth<{ id: string; priority: number; weight?: number }>>(
  providers: T[],
  signal?: AbortSignal,
): Promise<T | null> {
  if (providers.length === 0) {
    return null;
  }

  const ordered = orderProviders(providers);
  let degradedCandidate: T | null = null;
  let fallback: T | null = null;

  for (const provider of ordered) {
    const health = await evaluateHealth(provider, signal);
    if (health.status === "healthy") {
      return provider;
    }
    if (health.status === "degraded" && !degradedCandidate) {
      degradedCandidate = provider;
    }
    if (!fallback) {
      fallback = provider;
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

export async function getActiveChatProvider(signal?: AbortSignal): Promise<AIChatProvider | null> {
  return selectProvider(chatProviders, signal);
}

export async function getActiveEmbeddingProvider(signal?: AbortSignal): Promise<AIEmbeddingProvider | null> {
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

export function recordProviderFailure(
  providerId: string,
  error: unknown,
  properties?: Record<string, unknown>,
): void {
  const message = error instanceof Error ? error.message : String(error);
  serverAnalytics.capture({
    event: "ai_request_failed",
    distinctId: DISTINCT_ID,
    properties: {
      providerId,
      message,
      ...properties,
    },
  });
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
