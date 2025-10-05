import type {
  AIChatStreamRequest,
  AIChatStreamResult,
  AIChatUsage,
  AIEmbeddingRequest,
  AIEmbeddingResponse,
  AIProviderHealth,
} from "@/lib/ai/types";
import { env } from "@/lib/env-validation";

const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODELS_URL = "https://api.anthropic.com/v1/models";
const ANTHROPIC_EMBEDDINGS_URL = "https://api.anthropic.com/v1/embeddings";
const DEFAULT_ANTHROPIC_EMBEDDING_MODEL = "claude-embed-v1";
const ANTHROPIC_VERSION = "2023-06-01";

export class AnthropicConfigurationError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY is not configured. Update your environment before requesting a response.");
    this.name = "AnthropicConfigurationError";
  }
}

type AnthropicMessage = {
  role: "user" | "assistant";
  content: string;
};

type AnthropicStreamEvent =
  | {
      type: "content_block_delta";
      delta?: { type?: string; text?: string };
    }
  | {
      type: "message_delta";
      usage?: { input_tokens?: number; output_tokens?: number };
    }
  | { type: "message_stop" }
  | { type: "error"; error?: { message?: string } };

function convertMessages(options: AIChatStreamRequest): {
  system?: string;
  messages: AnthropicMessage[];
} {
  const systemMessages = options.messages
    .filter((message) => message.role === "system")
    .map((message) => message.content.trim())
    .filter(Boolean);

  const conversation = options.messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content,
    } satisfies AnthropicMessage));

  return {
    system: systemMessages.length > 0 ? systemMessages.join("\n\n") : undefined,
    messages: conversation,
  };
}

function toAnthropicUsage(event?: { input_tokens?: number; output_tokens?: number } | null): AIChatUsage | undefined {
  if (!event) return undefined;
  const promptTokens = event.input_tokens;
  const completionTokens = event.output_tokens;
  const totalTokens =
    typeof promptTokens === "number" || typeof completionTokens === "number"
      ? (promptTokens ?? 0) + (completionTokens ?? 0)
      : undefined;

  return {
    promptTokens,
    completionTokens,
    totalTokens,
  } satisfies AIChatUsage;
}

export async function createAnthropicChatStream(options: AIChatStreamRequest): Promise<AIChatStreamResult> {
  if (!env.ANTHROPIC_API_KEY) {
    throw new AnthropicConfigurationError();
  }

  const { system, messages } = convertMessages(options);
  const controller = new AbortController();
  if (options.signal) {
    options.signal.addEventListener("abort", () => controller.abort(options.signal?.reason));
  }

  // Anthropic only accepts metadata.user_id, not arbitrary metadata fields
  // Extract user_id if present in metadata, otherwise omit metadata entirely
  const anthropicMetadata = options.metadata?.userId
    ? { user_id: options.metadata.userId }
    : undefined;

  const response = await fetch(ANTHROPIC_MESSAGES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: options.model,
      messages,
      system,
      temperature: options.temperature,
      max_tokens: options.maxOutputTokens ?? 1024,
      top_p: options.topP,
      stream: true,
      ...(anthropicMetadata && { metadata: anthropicMetadata }),
    }),
    signal: controller.signal,
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Anthropic request failed with status ${response.status}: ${detail}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let resolveUsage: (usage: AIChatUsage | undefined) => void = () => undefined;
  let rejectUsage: (error: unknown) => void = () => undefined;
  const usagePromise = new Promise<AIChatUsage | undefined>((resolve, reject) => {
    resolveUsage = resolve;
    rejectUsage = reject;
  });

  const stream = (async function* anthropicStream() {
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
          let eventName: string | null = null;
          let dataPayload = "";
          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataPayload += line.slice(5).trim();
            }
          }

          if (!dataPayload || dataPayload === "[DONE]") {
            if (dataPayload === "[DONE]") {
              resolveUsage(undefined);
            }
            continue;
          }

          let parsed: AnthropicStreamEvent;
          try {
            parsed = JSON.parse(dataPayload) as AnthropicStreamEvent;
          } catch (error) {
            console.warn("Failed to parse Anthropic stream payload", error);
            continue;
          }

          const resolvedType = eventName ?? parsed.type;

          if (resolvedType === "content_block_delta") {
            const deltaEvent = parsed as Extract<AnthropicStreamEvent, { type: "content_block_delta" }>; 
            const text = deltaEvent.delta?.text;
            if (typeof text === "string" && text.length > 0) {
              yield text;
            }
          } else if (resolvedType === "message_delta") {
            const messageEvent = parsed as Extract<AnthropicStreamEvent, { type: "message_delta" }>; 
            const usage = toAnthropicUsage(messageEvent.usage);
            if (usage) {
              resolveUsage(usage);
            }
          } else if (resolvedType === "error") {
            const errorEvent = parsed as Extract<AnthropicStreamEvent, { type: "error" }>; 
            const error = new Error(errorEvent.error?.message ?? "Anthropic streaming error");
            rejectUsage(error);
            throw error;
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

export async function createAnthropicEmbedding(
  request: AIEmbeddingRequest,
): Promise<AIEmbeddingResponse> {
  if (!env.ANTHROPIC_API_KEY) {
    throw new AnthropicConfigurationError();
  }

  const inputs = Array.isArray(request.input) ? request.input : [request.input];
  if (inputs.length === 0) {
    return { embeddings: [] } satisfies AIEmbeddingResponse;
  }

  const controller = new AbortController();
  if (request.signal) {
    request.signal.addEventListener("abort", () => controller.abort(request.signal?.reason));
  }

  const response = await fetch(ANTHROPIC_EMBEDDINGS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: request.model || DEFAULT_ANTHROPIC_EMBEDDING_MODEL,
      input: inputs,
    }),
    signal: controller.signal,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    const status = response.status;
    if (status === 404 || status === 501) {
      throw new Error(
        `Anthropic embeddings are not enabled for this account. Received status ${status}: ${detail}`,
      );
    }
    throw new Error(`Anthropic embeddings request failed with status ${status}: ${detail}`);
  }

  const payload = (await response.json()) as {
    data: Array<{ embedding: number[]; index: number }>;
    model?: string;
    usage?: { input_tokens?: number; output_tokens?: number };
  };

  const embeddings = payload.data?.map((item) => item.embedding) ?? [];
  const dimensions = embeddings[0]?.length;

  return {
    embeddings,
    dimensions,
    model: payload.model ?? request.model ?? DEFAULT_ANTHROPIC_EMBEDDING_MODEL,
    usage: {
      promptTokens: payload.usage?.input_tokens,
      totalTokens:
        typeof payload.usage?.input_tokens === "number"
          ? payload.usage?.input_tokens
          : undefined,
    },
  } satisfies AIEmbeddingResponse;
}


export async function checkAnthropicHealth(signal?: AbortSignal): Promise<AIProviderHealth> {
  const checkedAt = Date.now();

  if (!env.ANTHROPIC_API_KEY) {
    return {
      providerId: "anthropic",
      status: "unavailable",
      error: {
        message: "ANTHROPIC_API_KEY is not configured",
        code: "missing_api_key",
      },
      checkedAt,
    } satisfies AIProviderHealth;
  }

  const start = Date.now();
  try {
    const response = await fetch(ANTHROPIC_MODELS_URL, {
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      signal,
    });
    const latencyMs = Date.now() - start;

    if (!response.ok) {
      return {
        providerId: "anthropic",
        status: "degraded",
        latencyMs,
        error: {
          message: `Anthropic health check failed with status ${response.status}`,
          code: String(response.status),
        },
        checkedAt,
      } satisfies AIProviderHealth;
    }

    return {
      providerId: "anthropic",
      status: "healthy",
      latencyMs,
      error: null,
      checkedAt,
    } satisfies AIProviderHealth;
  } catch (error) {
    const latencyMs = Date.now() - start;
    return {
      providerId: "anthropic",
      status: "unavailable",
      latencyMs,
      error: {
        message: error instanceof Error ? error.message : "Anthropic health check failed",
      },
      checkedAt,
    } satisfies AIProviderHealth;
  }
}


