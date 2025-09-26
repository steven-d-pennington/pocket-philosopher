export interface CoachCitation {
  id: string;
  title: string;
  reference: string;
  url?: string;
}

export interface ConversationTurn {
  role: "user" | "assistant" | "system";
  content: string;
}
