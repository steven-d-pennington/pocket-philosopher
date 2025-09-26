import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type CoachRole = "user" | "coach" | "system";

export interface CoachMessage {
  id: string;
  personaId: string;
  role: CoachRole;
  content: string;
  createdAt: string;
  streaming?: boolean;
}

export interface CoachPersona {
  id: string;
  name: string;
  title: string;
  description: string;
  expertise: string[];
  accentColor: string;
}

interface ConversationState {
  messages: CoachMessage[];
  isStreaming: boolean;
  tokens: number;
  typing: boolean;
}

interface CoachState {
  personas: CoachPersona[];
  activePersonaId: string;
  conversations: Record<string, ConversationState>;
  actions: {
    selectPersona: (personaId: string) => void;
    sendUserMessage: (personaId: string, content: string) => CoachMessage;
    startStreaming: (personaId: string, messageId: string) => void;
    appendStreamingChunk: (personaId: string, messageId: string, chunk: string, tokens: number) => void;
    completeStreaming: (personaId: string, messageId: string) => void;
    setTyping: (personaId: string, value: boolean) => void;
    resetConversation: (personaId: string) => void;
  };
}

const createInitialConversation = (): ConversationState => ({
  messages: [],
  isStreaming: false,
  tokens: 0,
  typing: false,
});

const defaultPersonas: CoachPersona[] = [
  {
    id: "marcus",
    name: "Marcus Aurelius",
    title: "Stoic Strategist",
    description: "Ground decisions in virtue and align actions with a calmer mind.",
    expertise: ["Stoicism", "Leadership", "Mindfulness"],
    accentColor: "bg-blue-500",
  },
  {
    id: "lao",
    name: "Laozi",
    title: "Taoist Navigator",
    description: "Flow with change, balance yin and yang, and find the effortless path.",
    expertise: ["Wu wei", "Flow", "Non-attachment"],
    accentColor: "bg-emerald-500",
  },
  {
    id: "simone",
    name: "Simone de Beauvoir",
    title: "Existential Companion",
    description: "Craft meaning through action and nurture courageous relationships.",
    expertise: ["Existentialism", "Ethics", "Relationships"],
    accentColor: "bg-purple-500",
  },
  {
    id: "epictetus",
    name: "Epictetus",
    title: "Discipline Coach",
    description: "Separate what you can control from the rest and train resilient focus.",
    expertise: ["Discipline", "Resilience", "Practicality"],
    accentColor: "bg-amber-500",
  },
];

const initialConversations = defaultPersonas.reduce<Record<string, ConversationState>>((acc, persona) => {
  acc[persona.id] = createInitialConversation();
  return acc;
}, {});

const initialState: Omit<CoachState, "actions"> = {
  personas: defaultPersonas,
  activePersonaId: defaultPersonas[0]?.id ?? "marcus",
  conversations: initialConversations,
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
};

const ensureConversation = (state: CoachState, personaId: string) => {
  if (!state.conversations[personaId]) {
    state.conversations[personaId] = createInitialConversation();
  }
  return state.conversations[personaId];
};

export const useCoachStore = create<CoachState>()(
  immer((set) => ({
    ...initialState,
    actions: {
      selectPersona: (personaId) => {
        set((state) => {
          ensureConversation(state, personaId);
          state.activePersonaId = personaId;
        });
      },
      sendUserMessage: (personaId, content) => {
        const message: CoachMessage = {
          id: createId(),
          personaId,
          role: "user",
          content,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const conversation = ensureConversation(state, personaId);
          conversation.messages.push(message);
          conversation.typing = true;
        });

        return message;
      },
      startStreaming: (personaId, messageId) => {
        set((state) => {
          const conversation = ensureConversation(state, personaId);
          conversation.isStreaming = true;
          conversation.tokens = 0;
          conversation.typing = true;
          conversation.messages.push({
            id: messageId,
            personaId,
            role: "coach",
            content: "",
            createdAt: new Date().toISOString(),
            streaming: true,
          });
        });
      },
      appendStreamingChunk: (personaId, messageId, chunk, tokens) => {
        set((state) => {
          const conversation = ensureConversation(state, personaId);
          const message = conversation.messages.find((item) => item.id === messageId);
          if (message) {
            message.content += chunk;
            message.streaming = true;
            conversation.tokens = tokens;
          }
        });
      },
      completeStreaming: (personaId, messageId) => {
        set((state) => {
          const conversation = ensureConversation(state, personaId);
          const message = conversation.messages.find((item) => item.id === messageId);
          if (message) {
            message.streaming = false;
          }
          conversation.isStreaming = false;
          conversation.typing = false;
        });
      },
      setTyping: (personaId, value) => {
        set((state) => {
          const conversation = ensureConversation(state, personaId);
          conversation.typing = value;
        });
      },
      resetConversation: (personaId) => {
        set((state) => {
          state.conversations[personaId] = createInitialConversation();
        });
      },
    },
  })),
);

export const selectActivePersona = (state: CoachState) =>
  state.personas.find((persona) => persona.id === state.activePersonaId) ?? state.personas[0];

export const selectActiveConversation = (state: CoachState) =>
  state.conversations[state.activePersonaId];
