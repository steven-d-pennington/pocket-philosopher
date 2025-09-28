import type { PersonaProfile } from "@/lib/ai/personas";
import type {
  AIChatMessage,
  CoachKnowledgeChunk,
  CoachUserContextSummary,
  ConversationTurn,
} from "@/lib/ai/types";

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
    "Always coach with warmth, empathy, and grounded philosophical rigor.",
    "Keep paragraphs under 90 words and avoid filler disclaimers.",
    "Offer two or three concise micro-actions tailored to the user's situation.",
    "When referencing provided knowledge snippets, cite them inline using [[chunk_id]].",
    "Do not invent citations. If no snippet fits, acknowledge and coach from general principles without a citation.",
    "Do not include a separate citations section; the client will render citations from the inline markers.",
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

export function buildCoachMessages(params: CoachPromptParams): AIChatMessage[] {
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

  return messages;
}
