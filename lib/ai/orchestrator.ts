import type { SupabaseClient } from "@supabase/supabase-js";

import { buildCoachMessages } from "@/lib/ai/prompts/coach";
import { getPersonaProfile } from "@/lib/ai/personas";
import type { ConversationMode } from "@/lib/stores/coach-store";
import {
  getActiveChatProvider,
  recordProviderFailure,
  recordProviderSuccess,
} from "@/lib/ai/provider-registry";
import { retrieveKnowledgeForCoach } from "@/lib/ai/retrieval";
import type {
  AIChatStreamResult,
  CoachCitation,
  CoachKnowledgeChunk,
  CoachStreamChunk,
  CoachStreamResult,
  CoachUserContextSummary,
  ConversationTurn,
} from "@/lib/ai/types";
import type { Database } from "@/lib/supabase/types";
import { serverAnalytics } from "@/lib/analytics/server";
import { createRequestLogger, type RequestLogger } from "@/lib/logging/logger";

interface CoachStreamOptions {
  supabase: SupabaseClient<Database>;
  userId: string;
  personaId: string;
  message: string;
  history: ConversationTurn[];
  mode?: ConversationMode;
  signal?: AbortSignal;
  logger?: RequestLogger;
}

interface CoachStreamSession {
  stream: AsyncGenerator<CoachStreamChunk, void, unknown>;
  finalize: () => Promise<CoachStreamResult>;
}

type ProfileContextRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "preferred_virtue" | "preferred_persona"
>;
type ReflectionContextRow = Pick<
  Database["public"]["Tables"]["reflections"]["Row"],
  "date" | "type" | "intention" | "lesson" | "gratitude" | "challenge" | "key_insights"
>;
type HabitContextRow = Pick<Database["public"]["Tables"]["habits"]["Row"], "name" | "virtue">;

type SupabaseClientType = SupabaseClient<Database>;

async function loadProfile(
  supabase: SupabaseClientType,
  userId: string,
): Promise<ProfileContextRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("preferred_virtue, preferred_persona")
    .eq("user_id", userId)
    .maybeSingle<ProfileContextRow>();

  if (error) {
    console.error("Failed to load profile context", error);
    return null;
  }

  return data ?? null;
}

async function loadRecentReflections(
  supabase: SupabaseClientType,
  userId: string,
): Promise<ReflectionContextRow[]> {
  const { data, error } = await supabase
    .from("reflections")
    .select("date, type, intention, lesson, gratitude, challenge, key_insights")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(5)
    .returns<ReflectionContextRow[]>();

  if (error) {
    console.error("Failed to load reflections for context", error);
    return [];
  }

  return data ?? [];
}

async function loadActiveHabits(
  supabase: SupabaseClientType,
  userId: string,
): Promise<HabitContextRow[]> {
  const { data, error } = await supabase
    .from("habits")
    .select("name, virtue")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(6)
    .returns<HabitContextRow[]>();

  if (error) {
    console.error("Failed to load habits for context", error);
    return [];
  }

  return data ?? [];
}

function summarizeReflection(row: ReflectionContextRow): string {
  const segments = [row.lesson, row.intention, row.gratitude, row.challenge]
    .map((value) => (value ?? "").trim())
    .filter(Boolean);
  if (row.key_insights && row.key_insights.length > 0) {
    segments.push(row.key_insights[0]);
  }
  if (segments.length === 0) {
    return "No highlight recorded.";
  }
  return segments[0]!;
}

async function buildUserContext(
  supabase: SupabaseClientType,
  userId: string,
): Promise<CoachUserContextSummary> {
  const [profile, reflections, habits] = await Promise.all([
    loadProfile(supabase, userId),
    loadRecentReflections(supabase, userId),
    loadActiveHabits(supabase, userId),
  ]);

  return {
    preferredVirtue: profile?.preferred_virtue ?? undefined,
    preferredPersona: profile?.preferred_persona ?? undefined,
    recentReflections: reflections.map((row) => ({
      date: row.date,
      type: row.type,
      highlight: summarizeReflection(row),
    })),
    activePractices: habits.map((habit) => ({
      name: habit.name,
      virtue: habit.virtue,
    })),
  };
}

function estimateTokensFromText(text: string): number {
  const normalized = text.trim();
  if (!normalized) {
    return 0;
  }
  return Math.max(1, Math.ceil(normalized.length / 4));
}

export function resolveCitations(
  content: string,
  knowledge: CoachKnowledgeChunk[],
  providedUsedIds?: Set<string>,
): { sanitized: string; citations: CoachCitation[] } {
  const citationPattern = /\[\[([^\]]+)\]\]/g;
  const usedIds = providedUsedIds || new Set<string>();
  
  if (!providedUsedIds) {
    let match: RegExpExecArray | null;
    while ((match = citationPattern.exec(content)) !== null) {
      const id = match[1]?.trim();
      if (id) {
        usedIds.add(id);
      }
    }
  }

  const knowledgeMap = new Map<string, CoachKnowledgeChunk>();
  knowledge.forEach((chunk) => knowledgeMap.set(chunk.id, chunk));

  const citations: CoachCitation[] = Array.from(usedIds).map((id) => {
    const source = knowledgeMap.get(id);
    if (!source) {
      return { id, title: id, reference: null };
    }

    const referenceFromMetadata =
      typeof source.metadata === "object" && source.metadata && "reference" in source.metadata
        ? String(source.metadata.reference)
        : undefined;
    const urlFromMetadata =
      typeof source.metadata === "object" && source.metadata && "url" in source.metadata
        ? String(source.metadata.url)
        : undefined;

    return {
      id,
      title: source.work,
      reference: source.section ?? referenceFromMetadata ?? null,
      url: urlFromMetadata,
    };
  });

  let sanitized = content
    .replace(/\s*\[\[([^\]]+)\]\]\s*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Remove any citations section that the AI might have generated despite instructions
  const citationsSectionPatterns = [
    /\n\s*(citations?|references?|sources?)\s*:\s*\n(?:[-•*]\s*.+\n?)+/gi,
    /\n\s*(citations?|references?|sources?)\s*:\s*\n(?:\d+\.\s*.+\n?)+/gi,
    /\n\s*citations?\s*\n(?:[-•*]\s*.+\n?)+/gi,
    /\n\s*references?\s*\n(?:[-•*]\s*.+\n?)+/gi,
    /\n\s*sources?\s*\n(?:[-•*]\s*.+\n?)+/gi,
    /\n\s*(citations?|references?|sources?)\s*\n(?:.+\n?)+/gi, // Citations followed by any content
  ];

  for (const pattern of citationsSectionPatterns) {
    sanitized = sanitized.replace(pattern, "").trim();
  }

  return { sanitized, citations };
}

export async function createCoachStream(options: CoachStreamOptions): Promise<CoachStreamSession> {
  const persona = getPersonaProfile(options.personaId);
  const baseLogger = (options.logger ?? createRequestLogger({ route: "lib/ai/orchestrator" }))
    .withUser(options.userId);
  const logger = baseLogger.child({
    metadata: {
      personaId: options.personaId,
      defaultModel: persona.defaultModel,
    },
  });

  const [knowledge, userContext] = await Promise.all([
    retrieveKnowledgeForCoach(options.supabase, persona, options.message),
    buildUserContext(options.supabase, options.userId),
  ]);

  const messages = buildCoachMessages({
    persona,
    message: options.message,
    history: options.history,
    userContext,
    knowledge,
    mode: options.mode,
  });

  const requestStartedAt = Date.now();
  const providerSelection = await getActiveChatProvider(options.signal);

  if (!providerSelection) {
    const error = new Error("No AI chat providers are currently available");
    logger.error("No AI chat providers available", error, {
      startedAt: new Date(requestStartedAt).toISOString(),
    });
    throw error;
  }

  const { provider, health, fallbackUsed, attempts } = providerSelection;
  const providerId = provider.id;
  const providerStatus = health.status;
  const attemptSummaries = attempts.map((attempt) => ({
    providerId: attempt.providerId,
    status: attempt.status,
  }));

  logger.info("Coach stream provider selected", {
    providerId,
    providerStatus,
    fallbackUsed,
    attempts: attemptSummaries,
    healthLatencyMs: health.latencyMs,
    healthCheckedAt: health.checkedAt,
    startedAt: new Date(requestStartedAt).toISOString(),
  });

  let aiStream: AIChatStreamResult;
  try {
    aiStream = await provider.createChatStream({
      messages,
      model: persona.defaultModel,
      temperature: persona.temperature,
      signal: options.signal,
      metadata: {
        personaId: options.personaId,
        fallbackUsed,
        historyTurns: options.history.length,
        knowledgeChunks: knowledge.length,
      },
    });
  } catch (error) {
    const durationMs = Date.now() - requestStartedAt;
    recordProviderFailure(providerId, error, {
      durationMs,
      metadata: {
        stage: "createChatStream",
        fallbackUsed,
        providerStatus,
        failoverCount: Math.max(0, attemptSummaries.length - 1),
        attempts: attemptSummaries,
      },
    });
    logger.error("Coach stream provider initialization failed", error, {
      providerId,
      providerStatus,
      fallbackUsed,
      durationMs,
    });
    throw error;
  }

  let aggregated = "";
  let lastTokenEstimate = 0;
  let outcomeRecorded = false;
  const allUsedIds = new Set<string>();

  const recordFailureOnce = (error: unknown, stage: string) => {
    if (outcomeRecorded) {
      return;
    }
    outcomeRecorded = true;
    const durationMs = Date.now() - requestStartedAt;
    recordProviderFailure(providerId, error, {
      durationMs,
      metadata: {
        stage,
        fallbackUsed,
        providerStatus,
        failoverCount: Math.max(0, attemptSummaries.length - 1),
        attempts: attemptSummaries,
      },
    });
    logger.error("Coach stream failed", error, {
      providerId,
      providerStatus,
      fallbackUsed,
      durationMs,
      stage,
    });
  };

  const stream = (async function* coachStreamGenerator() {
    let buffer = "";
    try {
      for await (const delta of aiStream.stream) {
        if (!delta) {
          continue;
        }
        
        buffer += delta;
        aggregated += delta;
        
        // Extract citation IDs from the accumulated buffer
        const citationPattern = /\[\[([^\]]+)\]\]/g;
        let match: RegExpExecArray | null;
        while ((match = citationPattern.exec(buffer)) !== null) {
          const id = match[1]?.trim();
          if (id) {
            allUsedIds.add(id);
          }
        }
        
        // Check if buffer ends with incomplete marker
        const endsWithIncompleteMarker = /\[\[[^\]]*$/.test(buffer);
        
        // Yield if we don't end with incomplete marker and have content
        if (!endsWithIncompleteMarker && buffer.length > 0) {
          // Remove all complete markers from the buffer
          const cleanBuffer = buffer.replace(/\s*\[\[([^\]]+)\]\]\s*/g, "");
          
          if (cleanBuffer.length > 0) {
            lastTokenEstimate = estimateTokensFromText(aggregated);
            yield { delta: cleanBuffer, tokens: lastTokenEstimate } satisfies CoachStreamChunk;
            buffer = ""; // Clear buffer after yielding
          }
        }
      }
      
      // Yield any remaining buffer content
      if (buffer.length > 0) {
        const cleanBuffer = buffer.replace(/\s*\[\[([^\]]+)\]\]\s*/g, "");
        if (cleanBuffer.length > 0) {
          lastTokenEstimate = estimateTokensFromText(aggregated);
          yield { delta: cleanBuffer, tokens: lastTokenEstimate } satisfies CoachStreamChunk;
        }
      }
    } catch (error) {
      recordFailureOnce(error, "stream");
      throw error;
    }
  })();

  let finalization: Promise<CoachStreamResult> | null = null;
  const finalize = () => {
    if (!finalization) {
      finalization = (async () => {
        let usage: Awaited<ReturnType<typeof aiStream.usage>> | undefined;
        try {
          usage = await aiStream.usage();
        } catch (error) {
          logger.warn("Failed to retrieve AI usage metrics", {
            providerId,
            error: error instanceof Error ? error.message : String(error),
          });
        }

        const { sanitized, citations } = resolveCitations(aggregated, knowledge, allUsedIds);
        const tokens = usage?.totalTokens ?? lastTokenEstimate ?? estimateTokensFromText(aggregated);
        const completedAt = Date.now();
        const latencyMs = completedAt - requestStartedAt;

        if (!outcomeRecorded) {
          outcomeRecorded = true;
          recordProviderSuccess(providerId, { latencyMs });
        }

        const analyticsProperties = {
          providerId,
          providerStatus,
          personaId: options.personaId,
          fallbackUsed,
          degradedMode: providerStatus === "degraded",
          failoverCount: Math.max(0, attemptSummaries.length - 1),
          latencyMs,
          startedAt: new Date(requestStartedAt).toISOString(),
          completedAt: new Date(completedAt).toISOString(),
          tokensPrompt: usage?.promptTokens ?? null,
          tokensCompletion: usage?.completionTokens ?? null,
          tokensTotal: tokens,
          attempts: attemptSummaries,
          knowledgeChunks: knowledge.length,
          historyTurns: options.history.length,
        } as const;

        logger.info("Coach stream completed", analyticsProperties);
        serverAnalytics.capture({
          event: "i_chat_completed",
          distinctId: options.userId,
          properties: analyticsProperties,
        });

        return {
          content: sanitized,
          citations,
          tokens,
        } satisfies CoachStreamResult;
      })();
    }
    return finalization;
  };

  return {
    stream,
    finalize,
  };
}

