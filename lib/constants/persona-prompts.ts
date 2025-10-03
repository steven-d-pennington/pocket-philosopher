/**
 * Persona-Specific Reflection Prompts
 * 
 * Each philosophical coach offers unique reflection questions
 * that guide users toward insights aligned with their tradition.
 */

export interface ReflectionPrompt {
  question: string;
  type: "morning" | "midday" | "evening";
  virtue?: string;
  depth: "surface" | "moderate" | "deep";
}

/**
 * Marcus Aurelius - The Stoic Strategist
 * Focus: Duty, virtue, self-examination, acceptance
 */
export const marcusPrompts = {
  morning: [
    {
      question: "What virtue will I practice today?",
      type: "morning" as const,
      depth: "surface" as const,
    },
    {
      question: "What obstacles might I face today, and how will I meet them with wisdom and courage?",
      type: "morning" as const,
      virtue: "Courage",
      depth: "moderate" as const,
    },
    {
      question: "How can I serve the common good today?",
      type: "morning" as const,
      virtue: "Justice",
      depth: "moderate" as const,
    },
    {
      question: "If today were my last, what would I most want to do? Am I doing that?",
      type: "morning" as const,
      depth: "deep" as const,
    },
    {
      question: "What is within my control today, and what must I accept as beyond it?",
      type: "morning" as const,
      virtue: "Wisdom",
      depth: "moderate" as const,
    },
  ],
  midday: [
    {
      question: "Am I acting in accordance with nature and reason?",
      type: "midday" as const,
      depth: "moderate" as const,
    },
    {
      question: "Have I responded to difficulties with virtue or with disturbance?",
      type: "midday" as const,
      virtue: "Temperance",
      depth: "moderate" as const,
    },
    {
      question: "Am I wasting time on things that don't matter?",
      type: "midday" as const,
      depth: "surface" as const,
    },
    {
      question: "How have I contributed to the welfare of others so far today?",
      type: "midday" as const,
      virtue: "Justice",
      depth: "moderate" as const,
    },
    {
      question: "Am I living as though I have forever, or as though death awaits?",
      type: "midday" as const,
      depth: "deep" as const,
    },
  ],
  evening: [
    {
      question: "What did I do well today? What could I have done better?",
      type: "evening" as const,
      depth: "surface" as const,
    },
    {
      question: "Did I act with justice, courage, temperance, and wisdom?",
      type: "evening" as const,
      depth: "moderate" as const,
    },
    {
      question: "What troubled me today that was actually indifferent?",
      type: "evening" as const,
      virtue: "Wisdom",
      depth: "deep" as const,
    },
    {
      question: "How did I respond when my will was thwarted? Did I remain calm?",
      type: "evening" as const,
      virtue: "Temperance",
      depth: "moderate" as const,
    },
    {
      question: "Am I a better person tonight than I was this morning? Why or why not?",
      type: "evening" as const,
      depth: "deep" as const,
    },
  ],
};

/**
 * Laozi - The Taoist Navigator
 * Focus: Flow, naturalness, balance, non-striving
 */
export const laoziPrompts = {
  morning: [
    {
      question: "How can I flow with today's events rather than force outcomes?",
      type: "morning" as const,
      depth: "moderate" as const,
    },
    {
      question: "What can I let go of today?",
      type: "morning" as const,
      virtue: "Temperance",
      depth: "surface" as const,
    },
    {
      question: "Where am I creating unnecessary complexity?",
      type: "morning" as const,
      virtue: "Wisdom",
      depth: "moderate" as const,
    },
    {
      question: "How can I be more like water today—soft, yielding, yet persistent?",
      type: "morning" as const,
      depth: "moderate" as const,
    },
    {
      question: "What does naturalness look like for me today?",
      type: "morning" as const,
      depth: "deep" as const,
    },
  ],
  midday: [
    {
      question: "Am I striving or allowing?",
      type: "midday" as const,
      depth: "moderate" as const,
    },
    {
      question: "Where am I resisting the natural flow of events?",
      type: "midday" as const,
      depth: "moderate" as const,
    },
    {
      question: "What opposites am I experiencing right now, and how do they complement each other?",
      type: "midday" as const,
      virtue: "Wisdom",
      depth: "deep" as const,
    },
    {
      question: "Am I acting from stillness or from agitation?",
      type: "midday" as const,
      virtue: "Temperance",
      depth: "moderate" as const,
    },
    {
      question: "What would happen if I did less rather than more?",
      type: "midday" as const,
      depth: "surface" as const,
    },
  ],
  evening: [
    {
      question: "Where did I try to control what couldn't be controlled?",
      type: "evening" as const,
      virtue: "Wisdom",
      depth: "moderate" as const,
    },
    {
      question: "When did things unfold naturally today, without my interference?",
      type: "evening" as const,
      depth: "surface" as const,
    },
    {
      question: "Did I find the balance between action and inaction?",
      type: "evening" as const,
      depth: "moderate" as const,
    },
    {
      question: "What taught me today when I stopped trying to learn?",
      type: "evening" as const,
      virtue: "Wisdom",
      depth: "deep" as const,
    },
    {
      question: "How was I like a valley today—empty, receptive, nourishing?",
      type: "evening" as const,
      depth: "deep" as const,
    },
  ],
};

/**
 * Simone de Beauvoir - The Existential Companion
 * Focus: Freedom, authenticity, consciousness, responsibility
 */
export const simonePrompts = {
  morning: [
    {
      question: "What will I freely choose to create today?",
      type: "morning" as const,
      virtue: "Courage",
      depth: "moderate" as const,
    },
    {
      question: "Am I living authentically, or am I playing a role others expect?",
      type: "morning" as const,
      depth: "deep" as const,
    },
    {
      question: "What project will I advance today that expresses who I'm becoming?",
      type: "morning" as const,
      depth: "moderate" as const,
    },
    {
      question: "Where am I hiding from my freedom today?",
      type: "morning" as const,
      virtue: "Courage",
      depth: "deep" as const,
    },
    {
      question: "How will I engage authentically with others today?",
      type: "morning" as const,
      virtue: "Justice",
      depth: "surface" as const,
    },
  ],
  midday: [
    {
      question: "Have I made genuine choices today, or have I simply followed convention?",
      type: "midday" as const,
      virtue: "Courage",
      depth: "moderate" as const,
    },
    {
      question: "Am I taking responsibility for my freedom, or am I making excuses?",
      type: "midday" as const,
      depth: "deep" as const,
    },
    {
      question: "Where have I acted in bad faith so far today?",
      type: "midday" as const,
      virtue: "Wisdom",
      depth: "deep" as const,
    },
    {
      question: "How have I created meaning today through my choices?",
      type: "midday" as const,
      depth: "moderate" as const,
    },
    {
      question: "Am I becoming who I want to be?",
      type: "midday" as const,
      depth: "surface" as const,
    },
  ],
  evening: [
    {
      question: "What did I freely choose today, and what did I blame on circumstance?",
      type: "evening" as const,
      virtue: "Courage",
      depth: "moderate" as const,
    },
    {
      question: "Did I live authentically today, or did I perform for others?",
      type: "evening" as const,
      depth: "deep" as const,
    },
    {
      question: "How did I create myself today through my actions?",
      type: "evening" as const,
      depth: "moderate" as const,
    },
    {
      question: "What constraints did I imagine that weren't really there?",
      type: "evening" as const,
      virtue: "Wisdom",
      depth: "deep" as const,
    },
    {
      question: "Who did I engage with genuinely, and who did I treat as an object?",
      type: "evening" as const,
      virtue: "Justice",
      depth: "deep" as const,
    },
  ],
};

/**
 * Epictetus - The Discipline Coach
 * Focus: Control, practice, resilience, clarity
 */
export const epictetusPrompts = {
  morning: [
    {
      question: "What is within my control today?",
      type: "morning" as const,
      virtue: "Wisdom",
      depth: "surface" as const,
    },
    {
      question: "What virtue will I practice today, no matter what happens?",
      type: "morning" as const,
      depth: "moderate" as const,
    },
    {
      question: "What difficulties might I face, and how will I use them to grow stronger?",
      type: "morning" as const,
      virtue: "Courage",
      depth: "moderate" as const,
    },
    {
      question: "What principle will guide my actions today?",
      type: "morning" as const,
      virtue: "Wisdom",
      depth: "moderate" as const,
    },
    {
      question: "How can I embody philosophy today rather than just think about it?",
      type: "morning" as const,
      depth: "deep" as const,
    },
  ],
  midday: [
    {
      question: "Have I been disturbed by externals, or have I maintained my composure?",
      type: "midday" as const,
      virtue: "Temperance",
      depth: "moderate" as const,
    },
    {
      question: "Am I using obstacles as opportunities to practice virtue?",
      type: "midday" as const,
      virtue: "Courage",
      depth: "moderate" as const,
    },
    {
      question: "Have I focused only on what's in my control?",
      type: "midday" as const,
      virtue: "Wisdom",
      depth: "surface" as const,
    },
    {
      question: "What judgments have I made that caused needless suffering?",
      type: "midday" as const,
      virtue: "Wisdom",
      depth: "deep" as const,
    },
    {
      question: "Am I living according to my principles?",
      type: "midday" as const,
      depth: "moderate" as const,
    },
  ],
  evening: [
    {
      question: "What was in my control today, and how did I handle it?",
      type: "evening" as const,
      virtue: "Wisdom",
      depth: "moderate" as const,
    },
    {
      question: "Did I practice my principles, or just profess them?",
      type: "evening" as const,
      depth: "deep" as const,
    },
    {
      question: "What external things disturbed me, and why did I give them power over me?",
      type: "evening" as const,
      virtue: "Temperance",
      depth: "moderate" as const,
    },
    {
      question: "How did today's challenges train me in virtue?",
      type: "evening" as const,
      virtue: "Courage",
      depth: "moderate" as const,
    },
    {
      question: "Am I a more disciplined person now than I was this morning?",
      type: "evening" as const,
      depth: "surface" as const,
    },
  ],
};

/**
 * Get reflection prompts for a specific persona and time of day
 */
export function getReflectionPrompts(
  personaId: string,
  type: "morning" | "midday" | "evening"
): ReflectionPrompt[] {
  switch (personaId) {
    case "marcus":
      return marcusPrompts[type];
    case "lao":
      return laoziPrompts[type];
    case "simone":
      return simonePrompts[type];
    case "epictetus":
      return epictetusPrompts[type];
    default:
      return marcusPrompts[type];
  }
}

/**
 * Get a suggested reflection prompt for a specific persona and time
 */
export function getSuggestedPrompt(
  personaId: string,
  type: "morning" | "midday" | "evening",
  depth?: "surface" | "moderate" | "deep"
): ReflectionPrompt {
  let prompts = getReflectionPrompts(personaId, type);

  if (depth) {
    const filtered = prompts.filter((p) => p.depth === depth);
    if (filtered.length > 0) {
      prompts = filtered;
    }
  }

  const today = new Date();
  const seed = today.getFullYear() * 1000 + today.getMonth() * 50 + today.getDate();
  const index = seed % prompts.length;

  return prompts[index];
}
