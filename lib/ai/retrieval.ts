import type { SupabaseClient } from "@supabase/supabase-js";

import type { PersonaProfile } from "@/lib/ai/personas";
import {
  getActiveEmbeddingProvider,
  recordProviderFailure,
  recordProviderSuccess,
} from "@/lib/ai/provider-registry";
import type { CoachKnowledgeChunk } from "@/lib/ai/types";
import type { Database } from "@/lib/supabase/types";

type SupabaseClientType = SupabaseClient<Database>;

type CachedRetrieval = {
  value: CoachKnowledgeChunk[];
  expiresAt: number;
};

const RETRIEVAL_CACHE_TTL_MS = 60_000;
const PROMPT_KEYWORD_LIMIT = 12;
const MAX_CANDIDATE_RESULTS = 24;

const retrievalCache = new Map<string, CachedRetrieval>();

const EMBEDDING_MODEL_BY_PROVIDER: Record<string, string> = {
  openai: "text-embedding-3-small",
  together: "togethercomputer/m2-bert-80M-light",
  anthropic: "claude-embed-v1",
  ollama: "nomic-embed-text",
};

function normalizeVector(input: unknown): number[] | null {
  if (!input) return null;
  if (Array.isArray(input)) {
    return input.map((value) => Number(value));
  }
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input) as number[];
      if (Array.isArray(parsed)) {
        return parsed.map((value) => Number(value));
      }
    } catch (error) {
      console.warn("Failed to parse embedding vector", error);
    }
  }
  return null;
}

function cosineSimilarity(a: number[] | null, b: number[] | null): number {
  if (!a || !b || a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }
  let dot = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let index = 0; index < a.length; index += 1) {
    const valueA = a[index] ?? 0;
    const valueB = b[index] ?? 0;
    dot += valueA * valueB;
    magnitudeA += valueA * valueA;
    magnitudeB += valueB * valueB;
  }
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  return dot / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

function tokenize(message: string): string[] {
  if (!message) return [];
  return (message.match(/[a-zA-Z]{3,}/g) ?? []).map((token) => token.toLowerCase());
}

function extractSearchQuery(message: string): string | null {
  const tokens = tokenize(message).slice(0, PROMPT_KEYWORD_LIMIT);
  if (tokens.length === 0) {
    return null;
  }
  return tokens.join(" ");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapChunk(row: any): CoachKnowledgeChunk {
  return {
    id: row.id,
    work: row.work,
    author: row.author,
    tradition: row.tradition,
    section: row.section,
    virtue: row.virtue,
    personaTags: row.persona_tags ?? null,
    content: row.content,
    citation: row.citation ?? null,
    metadata: row.metadata as Record<string, unknown> | null,
    embedding: normalizeVector(row.embedding),
    createdAt: row.created_at ?? null,
  } satisfies CoachKnowledgeChunk;
}

async function fetchPersonaChunks(
  supabase: SupabaseClientType,
  persona: PersonaProfile,
  searchQuery: string | null,
  limit: number,
): Promise<CoachKnowledgeChunk[]> {
  let query = supabase
    .from("philosophy_chunks")
    .select(
      "id, work, author, tradition, section, virtue, persona_tags, content, citation, embedding, metadata, created_at",
    )
    .limit(Math.max(limit * 2, limit))
    .order("created_at", { ascending: false });

  if (persona.knowledgeTags.length > 0) {
    query = query.overlaps("persona_tags", persona.knowledgeTags);
  }

  // Temporarily disable text search to test if persona chunks are found
  // if (searchQuery) {
  //   query = query.textSearch("content", searchQuery, { type: "websearch" });
  // }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch persona knowledge chunks", error);
    return [];
  }

  return (data ?? []).map(mapChunk);
}

async function fetchFallbackChunks(
  supabase: SupabaseClientType,
  excludeIds: string[],
  searchQuery: string | null,
  limit: number,
  personaTradition?: string,
): Promise<CoachKnowledgeChunk[]> {
  let query = supabase
    .from("philosophy_chunks")
    .select(
      "id, work, author, tradition, section, virtue, persona_tags, content, citation, embedding, metadata, created_at",
    )
    .limit(Math.max(limit * 2, limit))
    .order("created_at", { ascending: false });

  if (excludeIds.length > 0) {
    const quoted = excludeIds.map((id) => `'${id}'`).join(",");
    query = query.not("id", "in", `(${quoted})`);
  }

  // Filter by tradition if provided (allows same-tradition fallback)
  if (personaTradition) {
    query = query.eq("tradition", personaTradition);
  }

  // Temporarily disable text search to test if chunks are found
  // if (searchQuery) {
  //   query = query.textSearch("content", searchQuery, { type: "websearch" });
  // }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch fallback knowledge chunks", error);
    return [];
  }

  return (data ?? []).map(mapChunk);
}

function keywordScore(chunk: CoachKnowledgeChunk, tokens: string[]): number {
  if (!chunk.content || tokens.length === 0) {
    return 0;
  }
  const contentLower = chunk.content.toLowerCase();
  const matches = tokens.reduce((count, token) => (contentLower.includes(token) ? count + 1 : count), 0);
  return matches / tokens.length;
}

function personaAffinityScore(chunk: CoachKnowledgeChunk, persona: PersonaProfile): number {
  const personaTags = chunk.personaTags ?? [];
  if (personaTags.length === 0 || persona.knowledgeTags.length === 0) {
    return 0;
  }
  const matches = personaTags.filter((tag) => persona.knowledgeTags.includes(tag)).length;
  return matches / persona.knowledgeTags.length;
}

function recencyScore(chunk: CoachKnowledgeChunk): number {
  if (!chunk.createdAt) return 0;
  const created = new Date(chunk.createdAt).getTime();
  if (Number.isNaN(created)) {
    return 0;
  }
  const ageMs = Date.now() - created;
  const thirtyDaysMs = 1000 * 60 * 60 * 24 * 30;
  if (ageMs <= 0) {
    return 1;
  }
  return Math.max(0, 1 - ageMs / thirtyDaysMs);
}

function rerankChunks(
  chunks: CoachKnowledgeChunk[],
  options: {
    queryEmbedding: number[] | null;
    persona: PersonaProfile;
    tokens: string[];
  },
): CoachKnowledgeChunk[] {
  const ranked = chunks.map((chunk) => {
    const semantic = cosineSimilarity(options.queryEmbedding, chunk.embedding ?? null);
    const keywords = keywordScore(chunk, options.tokens);
    const personaAffinity = personaAffinityScore(chunk, options.persona);
    const recency = recencyScore(chunk);

    const relevance =
      semantic * 0.35 +
      keywords * 0.20 +
      personaAffinity * 0.40 +
      recency * 0.05;

    return { ...chunk, relevance } satisfies CoachKnowledgeChunk;
  });

  return ranked
    .sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0))
    .map((chunk) => ({ ...chunk, relevance: Number((chunk.relevance ?? 0).toFixed(4)) }));
}

async function getQueryEmbedding(
  message: string,
  signal?: AbortSignal,
): Promise<{ vector: number[] | null } | null> {
  if (!message.trim()) {
    return { vector: null };
  }

  const selection = await getActiveEmbeddingProvider(signal);
  if (!selection) {
    return null;
  }

  const { provider, attempts, fallbackUsed } = selection;
  const model = EMBEDDING_MODEL_BY_PROVIDER[provider.id] ?? provider.id;
  const startedAt = Date.now();
  try {
    const response = await provider.createEmbedding({
      model,
      input: message,
      signal,
    });
    recordProviderSuccess(provider.id, { latencyMs: Date.now() - startedAt });
    const vector = response.embeddings[0] ?? null;
    return { vector };
  } catch (error) {
    recordProviderFailure(provider.id, error, {
      durationMs: Date.now() - startedAt,
      metadata: {
        stage: "createEmbedding",
        fallbackUsed,
        failoverCount: Math.max(0, attempts.length - 1),
        attempts: attempts.map((attempt) => ({
          providerId: attempt.providerId,
          status: attempt.status,
        })),
      },
    });
    return null;
  }
}

function getCacheKey(persona: PersonaProfile, message: string): string {
  const normalized = message.trim().toLowerCase();
  return `${persona.id}::${normalized}`;
}

export async function retrieveKnowledgeForCoach(
  supabase: SupabaseClientType,
  persona: PersonaProfile,
  message: string,
  limit = 6,
): Promise<CoachKnowledgeChunk[]> {
  const cacheKey = getCacheKey(persona, message);
  const cached = retrievalCache.get(cacheKey);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.value.slice(0, limit);
  }

  const searchQuery = extractSearchQuery(message);
  const tokens = tokenize(message);
  const [personaChunks, queryEmbeddingResult] = await Promise.all([
    fetchPersonaChunks(supabase, persona, searchQuery, Math.max(limit, MAX_CANDIDATE_RESULTS / 2)),
    getQueryEmbedding(message, undefined),
  ]);

  const personaIds = new Set(personaChunks.map((chunk) => chunk.id));
  const fallback = await fetchFallbackChunks(
    supabase,
    Array.from(personaIds),
    searchQuery,
    Math.max(limit, MAX_CANDIDATE_RESULTS - personaChunks.length),
    persona.tradition,
  );

  const combined = [...personaChunks, ...fallback];
  const deduped = new Map<string, CoachKnowledgeChunk>();
  combined.forEach((chunk) => {
    if (!deduped.has(chunk.id)) {
      deduped.set(chunk.id, chunk);
    }
  });

  const reranked = rerankChunks(Array.from(deduped.values()), {
    queryEmbedding: queryEmbeddingResult?.vector ?? null,
    persona,
    tokens,
  });

  const selected = reranked.slice(0, limit);
  retrievalCache.set(cacheKey, {
    value: selected,
    expiresAt: now + RETRIEVAL_CACHE_TTL_MS,
  });

  return selected;
}
