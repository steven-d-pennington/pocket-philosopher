import type {
  AIChatStreamRequest,
  AIChatStreamResult,
  AIChatUsage,
  AIEmbeddingRequest,
  AIEmbeddingResponse,
  AIProviderHealth,
} from "@/lib/ai/types";
import { env } from "@/lib/env-validation";

const TOGETHER_CHAT_COMPLETIONS_URL = "https://api.together.xyz/v1/chat/completions";
const TOGETHER_EMBEDDINGS_URL = "https://api.together.xyz/v1/embeddings";
const TOGETHER_MODELS_URL = "https://api.together.xyz/v1/models";

export class TogetherConfigurationError extends Error {
  constructor() {
    super("TOGETHER_API_KEY is not configured. Update your environment before requesting a response.");
    this.name = "TogetherConfigurationError";
  }
}

interface TogetherStreamChunk {
  error?: { message?: string };
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

function toUsage(usage?: TogetherStreamChunk["usage"]): AIChatUsage | undefined {
  if (!usage) return undefined;
  return {
    promptTokens: usage.prompt_tokens,
    completionTokens: usage.completion_tokens,
    totalTokens: usage.total_tokens,
  } satisfies AIChatUsage;
}

export async function createTogetherChatStream(options: AIChatStreamRequest): Promise<AIChatStreamResult> {
  if (!env.TOGETHER_API_KEY) {
    throw new TogetherConfigurationError();
  }

  const controller = new AbortController();
  if (options.signal) {
    options.signal.addEventListener("abort", () => controller.abort(options.signal?.reason));
  }

  const response = await fetch(TOGETHER_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.TOGETHER_API_KEY}`,
    },
    body: JSON.stringify({
      model: options.model,
      messages: options.messages,
      temperature: options.temperature,
      stream: true,
      stream_options: { include_usage: true },
      max_tokens: options.maxOutputTokens,
      top_p: options.topP,
      metadata: options.metadata,
    }),
    signal: controller.signal,
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Together request failed with status ${response.status}: ${detail}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let resolveUsage: (usage: AIChatUsage | undefined) => void = () => undefined;
  let rejectUsage: (error: unknown) => void = () => undefined;
  const usagePromise = new Promise<AIChatUsage | undefined>((resolve, reject) => {
    resolveUsage = resolve;
    rejectUsage = reject;
  });

  const stream = (async function* togetherStreamGenerator() {
    let buffer = "";
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const segments = buffer.split("\n\n");
        buffer = segments.pop() ?? "";
        for (const segment of segments) {
          const lines = segment.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data:")) {
              continue;
            }
            const payload = line.slice(5).trim();
            if (!payload || payload === "[DONE]") {
              if (payload === "[DONE]") {
                resolveUsage(undefined);
              }
              continue;
            }

            let parsed: TogetherStreamChunk;
            try {
              parsed = JSON.parse(payload) as TogetherStreamChunk;
            } catch (error) {
              console.warn("Failed to parse Together payload", error);
              continue;
            }

            if (parsed.error) {
              const error = new Error(parsed.error?.message ?? "Together streaming error");
              rejectUsage(error);
              throw error;
            }

            const choice = parsed.choices?.[0];
            const delta: string | undefined = choice?.delta?.content;
            if (typeof delta === "string" && delta.length > 0) {
              yield delta;
            }

            const usage = toUsage(parsed.usage);
            if (usage) {
              resolveUsage(usage);
            }
          }
        }
      }
    } catch (error) {
      rejectUsage(error);
      throw error;
    } finally {
      await reader.cancel().catch(() => undefined);
    }
  })();

  return {
    stream,
    usage: () => usagePromise,
  } satisfies AIChatStreamResult;
}

interface TogetherEmbeddingResponsePayload {
  data: Array<{ embedding: number[] }>;
  model?: string;
  usage?: {
    prompt_tokens?: number;
    total_tokens?: number;
  };
}

export async function createTogetherEmbedding(
  request: AIEmbeddingRequest,
): Promise<AIEmbeddingResponse> {
  if (!env.TOGETHER_API_KEY) {
    throw new TogetherConfigurationError();
  }

  const controller = new AbortController();
  if (request.signal) {
    request.signal.addEventListener("abort", () => controller.abort(request.signal?.reason));
  }

  const response = await fetch(TOGETHER_EMBEDDINGS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.TOGETHER_API_KEY}`,
    },
    body: JSON.stringify({
      model: request.model,
      input: request.input,
    }),
    signal: controller.signal,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Together embeddings request failed with status ${response.status}: ${detail}`);
  }

  const payload = (await response.json()) as TogetherEmbeddingResponsePayload;
  const embeddings = payload.data.map((item) => item.embedding);
  const dimensions = embeddings[0]?.length;

  return {
    embeddings,
    dimensions,
    model: payload.model ?? request.model,
    usage: payload.usage
      ? {
          promptTokens: payload.usage.prompt_tokens,
          totalTokens: payload.usage.total_tokens,
        }
      : undefined,
  } satisfies AIEmbeddingResponse;
}

export async function checkTogetherHealth(signal?: AbortSignal): Promise<AIProviderHealth> {
  const checkedAt = Date.now();

  if (!env.TOGETHER_API_KEY) {
    return {
      providerId: "together",
      status: "unavailable",
      error: {
        message: "TOGETHER_API_KEY is not configured",
        code: "missing_api_key",
      },
      checkedAt,
    } satisfies AIProviderHealth;
  }

  const start = Date.now();
  try {
    const response = await fetch(TOGETHER_MODELS_URL, {
      headers: {
        Authorization: `Bearer ${env.TOGETHER_API_KEY}`,
      },
      signal,
    });
    const latencyMs = Date.now() - start;

    if (!response.ok) {
      return {
        providerId: "together",
        status: "degraded",
        latencyMs,
        error: {
          message: `Together health check failed with status ${response.status}`,
          code: String(response.status),
        },
        checkedAt,
      } satisfies AIProviderHealth;
    }

    return {
      providerId: "together",
      status: "healthy",
      latencyMs,
      error: null,
      checkedAt,
    } satisfies AIProviderHealth;
  } catch (error) {
    const latencyMs = Date.now() - start;
    return {
      providerId: "together",
      status: "unavailable",
      latencyMs,
      error: {
        message: error instanceof Error ? error.message : "Together health check failed",
      },
      checkedAt,
    } satisfies AIProviderHealth;
  }
}
