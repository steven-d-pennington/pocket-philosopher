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
  content: string;
  metadata?: Record<string, unknown> | null;
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
