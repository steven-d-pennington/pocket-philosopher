import { env } from "@/lib/env-validation";

export interface OpenAIChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIStreamOptions {
  messages: OpenAIChatMessage[];
  model: string;
  temperature: number;
  maxOutputTokens?: number;
  signal?: AbortSignal;
}

interface OpenAIUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

interface OpenAIStreamHandle {
  stream: AsyncGenerator<string, void, unknown>;
  usage: () => Promise<OpenAIUsage | undefined>;
}

interface OpenAIStreamChunk {
  error?: { message?: string };
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
  usage?: OpenAIUsage;
}

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

export class OpenAIConfigurationError extends Error {
  constructor() {
    super("OPENAI_API_KEY is not configured. Update your environment before requesting a coach response.");
    this.name = "OpenAIConfigurationError";
  }
}

export async function createOpenAIChatStream(options: OpenAIStreamOptions): Promise<OpenAIStreamHandle> {
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
      temperature: options.temperature,
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
  let resolveUsage: (usage: OpenAIUsage | undefined) => void = () => undefined;
  let rejectUsage: (error: unknown) => void = () => undefined;
  const usagePromise = new Promise<OpenAIUsage | undefined>((resolve, reject) => {
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
    usage: () => usagePromise,
  };
}
