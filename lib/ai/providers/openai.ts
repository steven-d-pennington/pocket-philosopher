import type {
  AIChatMessage,
  AIChatStreamRequest,
  AIChatStreamResult,
  AIChatUsage,
  AIEmbeddingRequest,
  AIEmbeddingResponse,
  AIProviderHealth,
} from "@/lib/ai/types";
import { env } from "@/lib/env-validation";


type OpenAIStreamOptions = AIChatStreamRequest & {
  messages: AIChatMessage[];
};

interface OpenAIUsageResponse {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

interface OpenAIStreamChunk {
  error?: { message?: string };
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
  usage?: OpenAIUsageResponse;
}

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";
const OPENAI_MODELS_URL = "https://api.openai.com/v1/models";

export class OpenAIConfigurationError extends Error {
  constructor() {
    super("OPENAI_API_KEY is not configured. Update your environment before requesting a coach response.");
    this.name = "OpenAIConfigurationError";
  }
}

function toAIUsage(usage?: OpenAIUsageResponse | null): AIChatUsage | undefined {
  if (!usage) return undefined;
  return {
    promptTokens: usage.prompt_tokens,
    completionTokens: usage.completion_tokens,
    totalTokens: usage.total_tokens,
  } satisfies AIChatUsage;
}

export async function createOpenAIChatStream(options: OpenAIStreamOptions): Promise<AIChatStreamResult> {
  if (!env.OPENAI_API_KEY) {
    throw new OpenAIConfigurationError();
  }

  const controller = new AbortController();
  if (options.signal) {
    options.signal.addEventListener("abort", () => controller.abort(options.signal?.reason));
  }

  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: options.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      stream: true,
      stream_options: { include_usage: true },
      max_completion_tokens: options.maxOutputTokens,
    }),
    signal: controller.signal,
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => "");
    throw new Error(`OpenAI request failed with status ${response.status}: ${detail}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let resolveUsage: (usage: OpenAIUsageResponse | undefined) => void = () => undefined;
  let rejectUsage: (error: unknown) => void = () => undefined;
  const usagePromise = new Promise<OpenAIUsageResponse | undefined>((resolve, reject) => {
    resolveUsage = resolve;
    rejectUsage = reject;
  });

  const stream = (async function* streamGenerator() {
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
            let parsed: OpenAIStreamChunk;
            try {
              parsed = JSON.parse(payload) as OpenAIStreamChunk;
            } catch (error) {
              console.warn("Failed to parse OpenAI payload", error);
              continue;
            }

            if (parsed.error) {
              const error = new Error(parsed.error?.message ?? "OpenAI streaming error");
              rejectUsage(error);
              throw error;
            }

            const choice = parsed.choices?.[0];
            const delta: string | undefined = choice?.delta?.content;
            if (typeof delta === "string" && delta.length > 0) {
              yield delta;
            }

            if (parsed.usage) {
              resolveUsage(parsed.usage);
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
    usage: () => usagePromise.then((usage) => toAIUsage(usage)),
  };
}

interface OpenAIEmbeddingResponsePayload {
  data: Array<{ embedding: number[] }>;
  model?: string;
  usage?: {
    prompt_tokens?: number;
    total_tokens?: number;
  };
}

export async function createOpenAIEmbedding(request: AIEmbeddingRequest): Promise<AIEmbeddingResponse> {
  if (!env.OPENAI_API_KEY) {
    throw new OpenAIConfigurationError();
  }

  const controller = new AbortController();
  let abortHandler: (() => void) | undefined;
  if (request.signal) {
    if (request.signal.aborted) {
      controller.abort(request.signal.reason);
    } else {
      abortHandler = () => controller.abort(request.signal?.reason);
      request.signal.addEventListener("abort", abortHandler);
    }
  }

  try {
    const response = await fetch(OPENAI_EMBEDDINGS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: request.model,
        input: request.input,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`OpenAI embeddings request failed with status ${response.status}: ${detail}`);
    }

    const payload = (await response.json()) as OpenAIEmbeddingResponsePayload;
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
  } finally {
    if (abortHandler) {
      request.signal?.removeEventListener("abort", abortHandler);
    }
  }
}

export async function checkOpenAIHealth(signal?: AbortSignal): Promise<AIProviderHealth> {
  const checkedAt = Date.now();

  if (!env.OPENAI_API_KEY) {
    return {
      providerId: "openai",
      status: "unavailable",
      error: {
        message: "OPENAI_API_KEY is not configured",
        code: "missing_api_key",
      },
      checkedAt,
    } satisfies AIProviderHealth;
  }

  const start = Date.now();
  try {
    const response = await fetch(OPENAI_MODELS_URL, {
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      signal,
    });
    const latencyMs = Date.now() - start;

    if (!response.ok) {
      return {
        providerId: "openai",
        status: "degraded",
        latencyMs,
        error: {
          message: `OpenAI health check failed with status ${response.status}`,
          code: String(response.status),
        },
        checkedAt,
      } satisfies AIProviderHealth;
    }

    return {
      providerId: "openai",
      status: "healthy",
      latencyMs,
      error: null,
      checkedAt,
    } satisfies AIProviderHealth;
  } catch (error) {
    const latencyMs = Date.now() - start;
    return {
      providerId: "openai",
      status: "unavailable",
      latencyMs,
      error: {
        message: error instanceof Error ? error.message : "OpenAI health check failed",
      },
      checkedAt,
    } satisfies AIProviderHealth;
  }
}

