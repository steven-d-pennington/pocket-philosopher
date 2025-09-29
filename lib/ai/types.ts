export type AIChatMessageRole = "system" | "user" | "assistant";

export interface AIChatMessage {
  role: AIChatMessageRole;
  content: string;
}

export interface AIChatUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface AIChatRequestBase {
  messages: AIChatMessage[];
  model: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  metadata?: Record<string, unknown>;
}

export interface AIChatStreamRequest extends AIChatRequestBase {
  signal?: AbortSignal;
}

export interface AIChatStreamResult {
  stream: AsyncGenerator<string, void, unknown>;
  usage: () => Promise<AIChatUsage | undefined>;
}

export interface AIEmbeddingRequest {
  model: string;
  input: string | string[];
  signal?: AbortSignal;
}

export interface AIEmbeddingResponse {
  embeddings: number[][];
  dimensions?: number;
  model?: string;
  usage?: {
    promptTokens?: number;
    totalTokens?: number;
  };
}

export type AIProviderStatus = "healthy" | "degraded" | "unavailable";

export interface AIProviderHealth {
  providerId: string;
  status: AIProviderStatus;
  latencyMs?: number;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  } | null;
  checkedAt: number;
}

export interface AIChatProvider {
  id: string;
  displayName: string;
  priority: number;
  weight?: number;
  createChatStream: (options: AIChatStreamRequest) => Promise<AIChatStreamResult>;
  checkHealth: (signal?: AbortSignal) => Promise<AIProviderHealth>;
}

export interface AIEmbeddingProvider {
  id: string;
  displayName: string;
  priority: number;
  weight?: number;
  createEmbedding: (request: AIEmbeddingRequest) => Promise<AIEmbeddingResponse>;
  checkHealth: (signal?: AbortSignal) => Promise<AIProviderHealth>;
}

export interface CoachCitation {
  id: string;
  title: string;
  reference?: string | null;
  url?: string;
}

export interface ConversationTurn {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface CoachKnowledgeChunk {
  id: string;
  work: string;
  author?: string | null;
  tradition?: string | null;
  section?: string | null;
  virtue?: string | null;
  personaTags?: string[] | null;
  content: string;
  metadata?: Record<string, unknown> | null;
  embedding?: number[] | null;
  createdAt?: string | null;
  relevance?: number;
}

export interface CoachUserContextSummary {
  preferredVirtue?: string | null;
  preferredPersona?: string | null;
  recentReflections: Array<{
    date: string;
    type: string;
    highlight: string;
  }>;
  activePractices: Array<{
    name: string;
    virtue?: string | null;
  }>;
}

export interface CoachStreamChunk {
  delta: string;
  tokens: number;
}

export interface CoachStreamResult {
  content: string;
  citations: CoachCitation[];
  tokens: number;
}
