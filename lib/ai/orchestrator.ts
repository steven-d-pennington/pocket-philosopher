import type { SupabaseClient } from "@supabase/supabase-js";

import { buildCoachMessages } from "@/lib/ai/prompts/coach";
import { getPersonaProfile } from "@/lib/ai/personas";
import { createOpenAIChatStream } from "@/lib/ai/providers/openai";
import { retrieveKnowledgeForCoach } from "@/lib/ai/retrieval";
import type {
  CoachCitation,
  CoachKnowledgeChunk,
  CoachStreamChunk,
  CoachStreamResult,
  CoachUserContextSummary,
  ConversationTurn,
} from "@/lib/ai/types";
import type { Database } from "@/lib/supabase/types";

interface CoachStreamOptions {
  supabase: SupabaseClient<Database>;
  userId: string;
  personaId: string;
  message: string;
  history: ConversationTurn[];
  signal?: AbortSignal;
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

function resolveCitations(
  content: string,
  knowledge: CoachKnowledgeChunk[],
): { sanitized: string; citations: CoachCitation[] } {
  const citationPattern = /\[\[([^\]]+)\]\]/g;
  const usedIds = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = citationPattern.exec(content)) !== null) {
    const id = match[1]?.trim();
    if (id) {
      usedIds.add(id);
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

  const sanitized = content
    .replace(citationPattern, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { sanitized, citations };
}

export async function createCoachStream(options: CoachStreamOptions): Promise<CoachStreamSession> {
  const persona = getPersonaProfile(options.personaId);
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
  });

  const openAIStream = await createOpenAIChatStream({
    messages,
    model: persona.defaultModel,
    temperature: persona.temperature,
    signal: options.signal,
  });

  let aggregated = "";
  let lastTokenEstimate = 0;

  const stream = (async function* coachStreamGenerator() {
    for await (const delta of openAIStream.stream) {
      if (!delta) {
        continue;
      }
      aggregated += delta;
      lastTokenEstimate = estimateTokensFromText(aggregated);
      yield { delta, tokens: lastTokenEstimate } satisfies CoachStreamChunk;
    }
  })();

  let finalization: Promise<CoachStreamResult> | null = null;
  const finalize = () => {
    if (!finalization) {
      finalization = (async () => {
        const usage = await openAIStream.usage().catch((error) => {
          console.error("Failed to retrieve OpenAI usage metrics", error);
          return undefined;
        });
        const { sanitized, citations } = resolveCitations(aggregated, knowledge);
        const tokens = usage?.totalTokens ?? lastTokenEstimate ?? estimateTokensFromText(aggregated);
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

