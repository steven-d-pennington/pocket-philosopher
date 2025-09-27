import type {
  AIChatStreamRequest,
  AIChatStreamResult,
  AIChatUsage,
  AIEmbeddingRequest,
  AIEmbeddingResponse,
  AIProviderHealth,
} from "@/lib/ai/types";
import { env } from "@/lib/env-validation";

export class OllamaConfigurationError extends Error {
  constructor() {
    super("OLLAMA_URL is not configured. Update your environment before requesting a response.");
    this.name = "OllamaConfigurationError";
  }
}

type OllamaChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OllamaStreamChunk = {
  message?: {
    role?: string;
    content?: string;
  };
  done?: boolean;
  error?: string;
  eval_count?: number;
  prompt_eval_count?: number;
};

function getBaseUrl(): string {
  const url = env.OLLAMA_URL?.replace(/\/+$/, "");
  if (!url) {
    throw new OllamaConfigurationError();
  }
  return url;
}

function toOllamaUsage(chunk?: OllamaStreamChunk): AIChatUsage | undefined {
  if (!chunk) return undefined;
  const promptTokens = chunk.prompt_eval_count;
  const completionTokens = chunk.eval_count;
  if (typeof promptTokens !== "number" && typeof completionTokens !== "number") {
    return undefined;
  }
  return {
    promptTokens,
    completionTokens,
    totalTokens:
      typeof promptTokens === "number" || typeof completionTokens === "number"
        ? (promptTokens ?? 0) + (completionTokens ?? 0)
        : undefined,
  } satisfies AIChatUsage;
}

export async function createOllamaChatStream(options: AIChatStreamRequest): Promise<AIChatStreamResult> {
  const baseUrl = getBaseUrl();
  const controller = new AbortController();
  if (options.signal) {
    options.signal.addEventListener("abort", () => controller.abort(options.signal?.reason));
  }

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model,
      messages: options.messages.map((message) => ({
        role: message.role,
        content: message.content,
      }) satisfies OllamaChatMessage),
      stream: true,
      options: {
        temperature: options.temperature,
      },
    }),
    signal: controller.signal,
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Ollama request failed with status ${response.status}: ${detail}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let resolveUsage: (usage: AIChatUsage | undefined) => void = () => undefined;
  let rejectUsage: (error: unknown) => void = () => undefined;
  const usagePromise = new Promise<AIChatUsage | undefined>((resolve, reject) => {
    resolveUsage = resolve;
    rejectUsage = reject;
  });

  const stream = (async function* ollamaStreamGenerator() {
    let buffer = "";
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        let newlineIndex = buffer.indexOf("\n");
        while (newlineIndex !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);
          newlineIndex = buffer.indexOf("\n");

          if (!line) {
            continue;
          }

          let parsed: OllamaStreamChunk;
          try {
            parsed = JSON.parse(line) as OllamaStreamChunk;
          } catch (error) {
            console.warn("Failed to parse Ollama payload", error);
            continue;
          }

          if (parsed.error) {
            const error = new Error(parsed.error || "Ollama streaming error");
            rejectUsage(error);
            throw error;
          }

          const text = parsed.message?.content;
          if (typeof text === "string" && text.length > 0) {
            yield text;
          }

          if (parsed.done) {
            resolveUsage(toOllamaUsage(parsed));
          }
        }
      }

      resolveUsage(undefined);
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

export async function createOllamaEmbedding(
  _request: AIEmbeddingRequest,
): Promise<AIEmbeddingResponse> {
  throw new Error("Ollama embeddings are not yet supported. Implement once upstream support is available.");
}

export async function checkOllamaHealth(signal?: AbortSignal): Promise<AIProviderHealth> {
  const checkedAt = Date.now();

  try {
    const baseUrl = getBaseUrl();
    const start = Date.now();
    const response = await fetch(`${baseUrl}/api/tags`, { signal });
    const latencyMs = Date.now() - start;

    if (!response.ok) {
      return {
        providerId: "ollama",
        status: "degraded",
        latencyMs,
        error: {
          message: `Ollama health check failed with status ${response.status}`,
          code: String(response.status),
        },
        checkedAt,
      } satisfies AIProviderHealth;
    }

    return {
      providerId: "ollama",
      status: "healthy",
      latencyMs,
      error: null,
      checkedAt,
    } satisfies AIProviderHealth;
  } catch (error) {
    const missingUrl = error instanceof OllamaConfigurationError || !env.OLLAMA_URL;
    return {
      providerId: "ollama",
      status: "unavailable",
      error: {
        message: error instanceof Error ? error.message : "Ollama health check failed",
        code: missingUrl ? "missing_url" : undefined,
      },
      checkedAt,
    } satisfies AIProviderHealth;
  }
}
