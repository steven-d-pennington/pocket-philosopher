import { getPersonaProfile } from "@/lib/ai/personas";
import type { CoachCitation, ConversationTurn } from "@/lib/ai/types";

interface OrchestratorInput {
  personaId: string;
  message: string;
  history: ConversationTurn[];
}

interface OrchestratorResult {
  content: string;
  citations: CoachCitation[];
  tokens: number;
}

const CHUNK_SIZE = 84;

function summarizeTopic(message: string): string {
  if (!message) return "this moment";
  const cleaned = message.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 80) {
    return cleaned;
  }
  return `${cleaned.slice(0, 77)}…`;
}

function buildMicroActions(message: string, virtues: string[]): string[] {
  const base = message.toLowerCase();
  const focus = virtues.slice(0, 3);

  const actions = focus.map((virtue) => {
    const capitalized = virtue.charAt(0).toUpperCase() + virtue.slice(1);
    if (base.includes("plan")) {
      return `${capitalized}: Block ten minutes today to outline the next deliberate step.`;
    }
    if (base.includes("stress") || base.includes("overwhelm")) {
      return `${capitalized}: Pause for three slow breaths, identify one controllable move, and schedule it.`;
    }
    if (base.includes("relationship")) {
      return `${capitalized}: Reach out to one person with a specific question or appreciation to strengthen connection.`;
    }
    return `${capitalized}: Journal two sentences tonight on how you practiced this virtue.`;
  });

  return actions;
}

function chunkContent(content: string): string[] {
  const chunks: string[] = [];
  let index = 0;
  while (index < content.length) {
    const nextIndex = Math.min(index + CHUNK_SIZE, content.length);
    chunks.push(content.slice(index, nextIndex));
    index = nextIndex;
  }
  return chunks;
}

export function orchestrateCoachResponse(input: OrchestratorInput): OrchestratorResult {
  const persona = getPersonaProfile(input.personaId);
  const quoteIndex = Math.abs(input.message.length + input.history.length) % persona.quotes.length;
  const quote = persona.quotes[quoteIndex];

  const topic = summarizeTopic(input.message);
  const microActions = buildMicroActions(input.message, persona.virtues);

  const acknowledgement = `You shared about ${topic}. Let's respond with ${persona.virtues[0]} and steadiness.`;
  const quoteLine = `${persona.name.split(" ")[0]} reminds us in ${quote.citation.title} (${quote.citation.reference}): “${quote.text}”`;
  const guidance = quote.lesson;

  const actionsList = microActions.map((action) => `- ${action}`).join("\n");

  const content = [
    persona.introduction,
    acknowledgement,
    quoteLine,
    guidance,
    "Micro-actions to explore:",
    actionsList,
    persona.closing,
  ]
    .filter(Boolean)
    .join("\n\n");

  const tokens = Math.ceil(content.length / 4);

  return {
    content,
    citations: [quote.citation],
    tokens,
  };
}

export function streamCoachResponse(content: string, citations: CoachCitation[]) {
  const chunks = chunkContent(content);
  return {
    chunks,
    citations,
    tokens: content.length,
  };
}
