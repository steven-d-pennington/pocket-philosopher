import { buildCoachMessages } from "@/lib/ai/prompts/coach";
import type { PersonaProfile } from "@/lib/ai/personas";

const persona: PersonaProfile = {
  id: "marcus",
  name: "Marcus Aurelius",
  title: "Stoic Emperor",
  tradition: "stoicism",
  voice: "Measured, compassionate, grounded in Stoic philosophy.",
  focus: "Help the user align thoughts and actions with virtue and reason.",
  virtues: ["wisdom", "justice"],
  signaturePractices: ["morning intention", "evening reflection"],
  conversationStyle: "Structured reflections followed by practical exercises.",
  knowledgeTags: ["marcus", "stoicism"],
  defaultModel: "gpt-4o-mini",
  temperature: 0.7,
  toneChecks: ["Stay calm", "Be pragmatic"],
  closingReminder: "Ask for one concrete action.",
  microActionExamples: ["Plan an evening review"],
};

const knowledge = [
  {
    id: "chunk-1",
    work: "Meditations",
    author: "Marcus Aurelius",
    tradition: "Stoic",
    section: "Book II",
    content: "Remember that you have power over your mind.",
    metadata: { reference: "Book II, 1" },
  },
];

const userContext = {
  preferredVirtue: "wisdom",
  preferredPersona: "marcus",
  recentReflections: [
    { date: "2025-09-27", type: "evening", highlight: "Stayed calm during conflict." },
  ],
  activePractices: [{ name: "Morning pages", virtue: "temperance" }],
};

describe("buildCoachMessages", () => {
  it("builds a prompt with system, knowledge, history, and user content", () => {
    const history = [
      { role: "user" as const, content: "How do I handle setbacks?" },
      { role: "assistant" as const, content: "Focus on what you can control." },
    ];

    const messages = buildCoachMessages({
      persona,
      message: "I feel stuck.",
      history,
      userContext,
      knowledge,
    });

    expect(messages[0]).toMatchObject({ role: "system" });
    expect(messages[1].content).toContain("Knowledge snippets");
    expect(messages[messages.length - 1].role).toBe("user");
    expect(messages[messages.length - 1].content).toContain("I feel stuck.");
    expect(messages[messages.length - 1].content).toContain("Preferred virtue focus");
  });
});
