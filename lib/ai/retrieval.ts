import type { SupabaseClient } from "@supabase/supabase-js";

import type { PersonaProfile } from "@/lib/ai/personas";
import type { CoachKnowledgeChunk } from "@/lib/ai/types";
import type { Database } from "@/lib/supabase/types";

type PhilosophyChunkRow = Database["public"]["Tables"]["philosophy_chunks"]["Row"];

type SupabaseClientType = SupabaseClient<Database>;

function extractSearchQuery(message: string): string | null {
  const tokens = (message.match(/[a-zA-Z]{3,}/g) ?? []).slice(0, 6);
  if (tokens.length === 0) {
    return null;
  }
  return tokens.join(" ");
}

function mapChunk(row: PhilosophyChunkRow): CoachKnowledgeChunk {
  return {
    id: row.id,
    work: row.work,
    author: row.author,
    tradition: row.tradition,
    section: row.section,
    content: row.content,
    metadata: row.metadata as Record<string, unknown> | null,
  };
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
      "id, work, author, tradition, section, virtue, persona_tags, content, embedding, metadata, created_at",
    )
    .limit(limit)
    .order("created_at", { ascending: false });

  if (persona.knowledgeTags.length > 0) {
    query = query.overlaps("persona_tags", persona.knowledgeTags);
  }

  if (searchQuery) {
    query = query.textSearch("content", searchQuery, { type: "websearch" });
  }

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
): Promise<CoachKnowledgeChunk[]> {
  let query = supabase
    .from("philosophy_chunks")
    .select(
      "id, work, author, tradition, section, virtue, persona_tags, content, embedding, metadata, created_at",
    )
    .limit(limit)
    .order("created_at", { ascending: false });

  if (excludeIds.length > 0) {
    const quoted = excludeIds.map((id) => `'${id}'`).join(",");
    query = query.not("id", "in", `(${quoted})`);
  }

  if (searchQuery) {
    query = query.textSearch("content", searchQuery, { type: "websearch" });
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch fallback knowledge chunks", error);
    return [];
  }

  return (data ?? []).map(mapChunk);
}

export async function retrieveKnowledgeForCoach(
  supabase: SupabaseClientType,
  persona: PersonaProfile,
  message: string,
  limit = 6,
): Promise<CoachKnowledgeChunk[]> {
  const searchQuery = extractSearchQuery(message);
  const personaChunks = await fetchPersonaChunks(supabase, persona, searchQuery, limit);

  if (personaChunks.length >= limit) {
    return personaChunks.slice(0, limit);
  }

  const fallback = await fetchFallbackChunks(
    supabase,
    personaChunks.map((chunk) => chunk.id),
    searchQuery,
    limit - personaChunks.length,
  );

  const combined = [...personaChunks, ...fallback];
  const unique = new Map<string, CoachKnowledgeChunk>();
  combined.forEach((chunk) => {
    if (!unique.has(chunk.id)) {
      unique.set(chunk.id, chunk);
    }
  });

  return Array.from(unique.values()).slice(0, limit);
}
