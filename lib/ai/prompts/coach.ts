import type { PersonaProfile } from "@/lib/ai/personas";
import type {
  AIChatMessage,
  CoachKnowledgeChunk,
  CoachUserContextSummary,
  ConversationTurn,
} from "@/lib/ai/types";

const PROMPT_CACHE_TTL_MS = 30_000;

type CachedPrompt = {
  expiresAt: number;
  messages: AIChatMessage[];
};

const promptCache = new Map<string, CachedPrompt>();

function buildKnowledgeBlock(chunks: CoachKnowledgeChunk[]): string {
  if (chunks.length === 0) {
    return "No knowledge snippets were retrieved for this request.";
  }

  return chunks
    .map((chunk) => {
      const headerParts = [chunk.work];
      if (chunk.section) {
        headerParts.push(chunk.section);
      }
      if (chunk.author) {
        headerParts.push(`by ${chunk.author}`);
      }
      if (chunk.virtue) {
        headerParts.push(`virtue: ${chunk.virtue}`);
      }
      const header = headerParts.join(" · ");
      return `[[${chunk.id}]] ${header}\n${chunk.content}`;
    })
    .join("\n\n---\n\n");
}

function buildUserContextBlock(context: CoachUserContextSummary): string {
  const lines: string[] = [];
  if (context.preferredVirtue) {
    lines.push(`Preferred virtue focus: ${context.preferredVirtue}`);
  }
  if (context.preferredPersona) {
    lines.push(`Preferred persona: ${context.preferredPersona}`);
  }
  if (context.activePractices.length > 0) {
    const practices = context.activePractices.map((item) =>
      item.virtue ? `${item.name} (${item.virtue})` : item.name,
    );
    lines.push(`Active practices: ${practices.join(", ")}`);
  }
  if (context.recentReflections.length > 0) {
    const reflections = context.recentReflections
      .map((entry) => `${entry.date} ${entry.type}: ${entry.highlight}`)
      .join(" | ");
    lines.push(`Recent reflections: ${reflections}`);
  }
  if (lines.length === 0) {
    return "No additional user context is available.";
  }
  return lines.join("\n");
}

function transformHistory(history: ConversationTurn[]): AIChatMessage[] {
  return history.slice(-12).map((turn) => ({
    role: turn.role,
    content: turn.content,
  }));
}

function buildSystemPrompt(persona: PersonaProfile): string {
  return [
    `You are ${persona.name}, the ${persona.title}.`,
    persona.voice,
    `Focus: ${persona.focus}.`,
    `Core virtues: ${persona.virtues.join(", ")}.`,
    `Signature practices you may recommend: ${persona.signaturePractices.join(", ")}.`,
    `Tone checks to uphold: ${persona.toneChecks.join("; ")}.`,
    "Always coach with warmth, empathy, and grounded philosophical rigor.",
    "Keep paragraphs under 90 words and avoid filler disclaimers.",
    `Offer two or three concise micro-actions tailored to the user's situation. Examples: ${persona.microActionExamples.join(", ")}.`,
    "When referencing provided knowledge snippets, cite them inline using [[chunk_id]].",
    "Do not invent citations. If no snippet fits, acknowledge and coach from general principles without a citation.",
    "Do not include a separate citations section; the client will render citations from the inline markers.",
    persona.closingReminder,
  ]
    .filter(Boolean)
    .join("\n");
}

export interface CoachPromptParams {
  persona: PersonaProfile;
  message: string;
  history: ConversationTurn[];
  userContext: CoachUserContextSummary;
  knowledge: CoachKnowledgeChunk[];
}

function buildPromptCacheKey(params: CoachPromptParams): string {
  const historyKey = params.history
    .slice(-6)
    .map((turn) => `${turn.role}:${turn.content.length}`)
    .join("|");
  const knowledgeKey = params.knowledge.map((chunk) => `${chunk.id}:${chunk.relevance ?? 0}`).join(",");
  const contextKey = [
    params.userContext.preferredPersona ?? "",
    params.userContext.preferredVirtue ?? "",
    params.userContext.activePractices.length,
    params.userContext.recentReflections.length,
  ].join(":");
  return `${params.persona.id}::${params.message.trim().toLowerCase()}::${knowledgeKey}::${contextKey}::${historyKey}`;
}

function cloneMessages(messages: AIChatMessage[]): AIChatMessage[] {
  return messages.map((message) => ({ ...message }));
}

export function buildCoachMessages(params: CoachPromptParams): AIChatMessage[] {
  const cacheKey = buildPromptCacheKey(params);
  const cached = promptCache.get(cacheKey);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cloneMessages(cached.messages);
  }

  const systemPrompt = buildSystemPrompt(params.persona);
  const knowledgeBlock = buildKnowledgeBlock(params.knowledge);
  const userContextBlock = buildUserContextBlock(params.userContext);
  const historyMessages = transformHistory(params.history);

  const messages: AIChatMessage[] = [
    { role: "system", content: systemPrompt },
    {
      role: "system",
      content: `Knowledge snippets for grounding (use when relevant):\n${knowledgeBlock}`,
    },
    ...historyMessages,
    {
      role: "user",
      content: [
        "Here is the user's latest reflection/question:",
        params.message,
        "\nUser context:",
        userContextBlock,
        "Respond in the voice and style described in the system prompt, grounding insights in the knowledge snippets when they apply.",
      ].join("\n\n"),
    },
  ];

  promptCache.set(cacheKey, {
    messages,
    expiresAt: now + PROMPT_CACHE_TTL_MS,
  });

  return cloneMessages(messages);
}
