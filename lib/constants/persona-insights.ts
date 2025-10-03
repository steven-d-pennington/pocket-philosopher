/**
 * Persona Insights & Daily Tips
 * 
 * Each philosophical coach offers daily insights, tips, and wisdom
 * that reflect their unique perspective and teaching style.
 */

export interface PersonaInsight {
  title: string;
  content: string;
  category: "mindset" | "practice" | "wisdom" | "reflection" | "action";
  timeframe?: string; // When to apply this (morning, evening, etc.)
}

/**
 * Marcus Aurelius - The Stoic Strategist
 * Focus: Practical wisdom for daily challenges, leadership, duty
 */
export const marcusInsights: PersonaInsight[] = [
  {
    title: "Begin with the Day's Challenges",
    content: "Each morning, prepare yourself: 'Today I will meet the busybody, the ungrateful, the arrogant.' By anticipating difficulties, you won't be caught off-guard. You'll meet them with composure.",
    category: "mindset",
    timeframe: "morning",
  },
  {
    title: "The View from Above",
    content: "When overwhelmed, imagine yourself rising above the earth—see cities, seas, mountains. Notice how small your concerns appear from this height. This cosmic perspective brings tranquility.",
    category: "practice",
    timeframe: "anytime",
  },
  {
    title: "Your Three Duties",
    content: "Remember daily: duty to yourself (self-discipline), duty to others (justice and kindness), and duty to the divine order (acceptance). Let these guide your actions.",
    category: "wisdom",
    timeframe: "morning",
  },
  {
    title: "Evening Examination",
    content: "Before sleep, review the day. What did I do well? Where did I act against virtue? What should I practice tomorrow? This daily audit builds wisdom.",
    category: "reflection",
    timeframe: "evening",
  },
  {
    title: "The Obstacle Is the Way",
    content: "What blocks your path? That obstacle contains the path forward. Fire tests gold; adversity tests character. Turn impediments into fuel for growth.",
    category: "mindset",
    timeframe: "anytime",
  },
  {
    title: "Practice Mortality",
    content: "You could leave life right now. Let that truth guide your actions today. Don't postpone goodness. Don't waste time on trivialities. Act as if each moment is your last opportunity to demonstrate virtue.",
    category: "wisdom",
    timeframe: "morning",
  },
  {
    title: "Confine Yourself to the Present",
    content: "Past and future are mental constructions. The present moment is the only thing you control. Practice bringing your attention back to now, repeatedly, patiently.",
    category: "practice",
    timeframe: "anytime",
  },
  {
    title: "Choose Your Company Wisely",
    content: "You become like those you spend time with. Seek those who challenge you to be better. Avoid those who drag you down. Your associations shape your character.",
    category: "action",
    timeframe: "anytime",
  },
  {
    title: "The Discipline of Perception",
    content: "Events are neutral; your judgments color them. Practice seeing things as they are, not as you fear or desire them to be. Strip away the emotional labels.",
    category: "practice",
    timeframe: "anytime",
  },
  {
    title: "Lead by Example",
    content: "The best leadership is modeling virtue. Don't demand from others what you don't embody yourself. Let your actions speak louder than your words.",
    category: "action",
    timeframe: "anytime",
  },
  {
    title: "Gratitude as Practice",
    content: "Each morning, list three privileges you have: breath, consciousness, the ability to reason. Gratitude for existence itself transforms your disposition.",
    category: "reflection",
    timeframe: "morning",
  },
  {
    title: "Anger Is Self-Harm",
    content: "Notice how anger hurts you more than its target. It clouds judgment, wastes energy, and damages relationships. When you feel it rising, pause. Ask: 'Is this within my control?'",
    category: "mindset",
    timeframe: "anytime",
  },
];

/**
 * Laozi - The Taoist Navigator
 * Focus: Flow, naturalness, simplicity, wu wei
 */
export const laoziInsights: PersonaInsight[] = [
  {
    title: "The Power of Softness",
    content: "Water flows around obstacles without resistance, yet it shapes mountains over time. Practice softness in your responses. Yield, adapt, persist gently.",
    category: "mindset",
    timeframe: "anytime",
  },
  {
    title: "Wu Wei: Effortless Action",
    content: "When you force things, you create resistance. When you flow with circumstances, you move with nature's power. Today, notice where you're pushing—can you yield instead?",
    category: "practice",
    timeframe: "anytime",
  },
  {
    title: "Simplify Your Life",
    content: "Each possession, commitment, and desire adds complexity. What can you release today? Empty space creates room for what naturally belongs.",
    category: "action",
    timeframe: "morning",
  },
  {
    title: "Be Like Water",
    content: "Water takes the shape of any container, flows to the lowest point, nourishes without demanding credit. Practice this formless adaptability in your interactions.",
    category: "wisdom",
    timeframe: "anytime",
  },
  {
    title: "The Stillness Practice",
    content: "Muddy water becomes clear when it's allowed to settle. Sit quietly each morning. Don't force clarity—let it emerge naturally from stillness.",
    category: "practice",
    timeframe: "morning",
  },
  {
    title: "The Paradox of Striving",
    content: "The more you chase something, the more it eludes you. Stop chasing. Create conditions and allow natural attraction to do its work.",
    category: "mindset",
    timeframe: "anytime",
  },
  {
    title: "Live Close to the Ground",
    content: "Grandiosity creates distance from truth. Stay humble, practical, and grounded. The tallest trees catch the strongest winds; the grass bends and survives.",
    category: "wisdom",
    timeframe: "anytime",
  },
  {
    title: "The Art of Timing",
    content: "There's a season for planting and a season for harvesting. Don't act prematurely out of anxiety. Don't delay out of comfort. Feel the natural rhythm.",
    category: "action",
    timeframe: "anytime",
  },
  {
    title: "Empty Yourself",
    content: "A cup full of old tea cannot receive fresh tea. Each evening, empty your mind of the day's accumulated opinions and judgments. Return to beginner's mind.",
    category: "reflection",
    timeframe: "evening",
  },
  {
    title: "The Power of Not-Knowing",
    content: "Certainty closes doors. Admitting 'I don't know' opens you to learning. Practice the freedom of uncertainty today.",
    category: "mindset",
    timeframe: "anytime",
  },
  {
    title: "Speak Less, Listen More",
    content: "Those who know don't speak constantly. Those who speak constantly don't know. Practice silence. Let others reveal themselves while you remain receptive.",
    category: "practice",
    timeframe: "anytime",
  },
  {
    title: "Follow the Natural Way",
    content: "Watch how nature operates: without force, without anxiety, without hurry. Trees don't strain to grow. Rivers don't struggle to flow. Trust your natural unfolding.",
    category: "wisdom",
    timeframe: "morning",
  },
];

/**
 * Simone de Beauvoir - The Existential Companion
 * Focus: Freedom, authenticity, choice, meaning-making
 */
export const simoneInsights: PersonaInsight[] = [
  {
    title: "You Are Your Choices",
    content: "Your essence isn't fixed—it's created through your choices. Each decision writes your story. What will you choose to become today?",
    category: "mindset",
    timeframe: "morning",
  },
  {
    title: "Act Despite Uncertainty",
    content: "You'll never have complete information or guaranteed outcomes. Act anyway. Waiting for certainty is choosing not to live. Embrace the ambiguity and move forward.",
    category: "action",
    timeframe: "anytime",
  },
  {
    title: "Authentic Relationships",
    content: "Be with others as you truly are, not as you think they want you to be. Authenticity invites authenticity. Pretense creates distance.",
    category: "wisdom",
    timeframe: "anytime",
  },
  {
    title: "Freedom Is Practice",
    content: "You're condemned to be free—you must choose, always. This isn't a burden; it's your power. Practice owning your choices without blaming circumstances.",
    category: "practice",
    timeframe: "anytime",
  },
  {
    title: "Examine Your Stories",
    content: "You tell yourself stories about who you are. Are they true, or are they limitations you've accepted? Challenge one self-story today.",
    category: "reflection",
    timeframe: "evening",
  },
  {
    title: "Create Your Values",
    content: "Values aren't discovered; they're created through commitment and action. What you repeatedly do reveals what you truly value—not what you say you value.",
    category: "mindset",
    timeframe: "anytime",
  },
  {
    title: "Resist Objectification",
    content: "When others try to define you, remember: you're a subject, not an object. You're a becoming, not a fixed thing. Refuse to be reduced.",
    category: "wisdom",
    timeframe: "anytime",
  },
  {
    title: "The Weight of Responsibility",
    content: "You're responsible for your choices, but you're not responsible for your situation. Know the difference. Take ownership of your agency within constraints.",
    category: "mindset",
    timeframe: "anytime",
  },
  {
    title: "Meaningful Work",
    content: "Work becomes meaningful when it serves a project beyond survival. What larger project does your daily labor serve? If none, can you create one?",
    category: "action",
    timeframe: "morning",
  },
  {
    title: "The Ethics of Freedom",
    content: "Your freedom is intertwined with others' freedom. You can't be fully free if you oppress others. Support the liberation of all.",
    category: "wisdom",
    timeframe: "anytime",
  },
  {
    title: "Becoming vs. Being",
    content: "You're not a fixed self—you're always becoming. Yesterday's version of you isn't today's obligation. Practice allowing yourself to evolve.",
    category: "practice",
    timeframe: "evening",
  },
  {
    title: "Choose Your Commitments",
    content: "Commitments don't limit freedom—they focus it. Choose what to commit to, then let that commitment guide your choices. This is how you create meaning.",
    category: "action",
    timeframe: "morning",
  },
];

/**
 * Epictetus - The Discipline Coach
 * Focus: Control, resilience, practice, mental training
 */
export const epictetusInsights: PersonaInsight[] = [
  {
    title: "The Dichotomy of Control",
    content: "Start each day by distinguishing: What's within my control? (My choices, responses, efforts.) What's outside it? (Everything else.) Focus only on the first category.",
    category: "mindset",
    timeframe: "morning",
  },
  {
    title: "Train Like an Athlete",
    content: "Philosophy isn't theory—it's training. Just as athletes build muscle through repetition, you build virtue through practice. What will you practice today?",
    category: "practice",
    timeframe: "morning",
  },
  {
    title: "Your Judgments, Your Life",
    content: "You're not disturbed by events, but by your judgments about events. When something upsets you, examine the judgment you're making. That's where your power lies.",
    category: "wisdom",
    timeframe: "anytime",
  },
  {
    title: "Demand Nothing from Others",
    content: "People will be unreasonable, selfish, and difficult. This is their nature. Expecting otherwise is like being angry that fire burns. Accept human nature as it is.",
    category: "mindset",
    timeframe: "anytime",
  },
  {
    title: "Rehearse Adversity",
    content: "Imagine your worst fears happening. Rehearse your response mentally. When difficulty comes (and it will), you'll have practiced resilience in advance.",
    category: "practice",
    timeframe: "anytime",
  },
  {
    title: "Choose Your Impressions",
    content: "An impression arises: 'This is terrible.' Pause. Is it? Or is that just your initial judgment? Practice choosing your second thought more carefully.",
    category: "action",
    timeframe: "anytime",
  },
  {
    title: "Progress Over Perfection",
    content: "You'll fail often. That's not failure—that's practice. The goal isn't flawless virtue today, but steady improvement over time. Be patient with yourself.",
    category: "mindset",
    timeframe: "evening",
  },
  {
    title: "Own Your Responsibilities",
    content: "Blaming others is admitting you're not in control. Blaming yourself is the beginning of education. Taking full ownership is the completion of it.",
    category: "reflection",
    timeframe: "evening",
  },
  {
    title: "Simplify Your Desires",
    content: "Each desire is a vote for dissatisfaction. Reduce your wants. Find contentment in what's already present. This is the path to freedom.",
    category: "wisdom",
    timeframe: "anytime",
  },
  {
    title: "The Morning Resolve",
    content: "Before rising, declare: 'Today I will practice patience, honesty, and goodwill.' Name your specific training objectives. Then pursue them.",
    category: "action",
    timeframe: "morning",
  },
  {
    title: "Respond, Don't React",
    content: "Between stimulus and response, there's a space. Practice widening that space. Take a breath. Choose your response deliberately. This is freedom.",
    category: "practice",
    timeframe: "anytime",
  },
  {
    title: "Your Inner Citadel",
    content: "No one can invade your inner self without your permission. Your thoughts, your will—these remain yours. Protect this inner freedom above all else.",
    category: "wisdom",
    timeframe: "anytime",
  },
];

/**
 * Get insights for a specific persona
 */
export function getInsightsForPersona(personaId: string): PersonaInsight[] {
  switch (personaId) {
    case "marcus":
      return marcusInsights;
    case "lao":
      return laoziInsights;
    case "simone":
      return simoneInsights;
    case "epictetus":
      return epictetusInsights;
    default:
      return marcusInsights;
  }
}

/**
 * Get a daily insight for a specific persona
 * Uses date-based seeding for consistency throughout the day
 */
export function getDailyInsight(personaId: string, date: Date = new Date()): PersonaInsight {
  const insights = getInsightsForPersona(personaId);
  const seed = date.getFullYear() * 1000 + date.getMonth() * 50 + date.getDate();
  const index = seed % insights.length;
  return insights[index];
}

/**
 * Get insights by category
 */
export function getInsightsByCategory(
  personaId: string,
  category: PersonaInsight["category"],
): PersonaInsight[] {
  const insights = getInsightsForPersona(personaId);
  return insights.filter((insight) => insight.category === category);
}

/**
 * Get insights by timeframe
 */
export function getInsightsByTimeframe(
  personaId: string,
  timeframe: "morning" | "evening" | "anytime",
): PersonaInsight[] {
  const insights = getInsightsForPersona(personaId);
  if (timeframe === "anytime") {
    return insights; // Return all if anytime is requested
  }
  return insights.filter((insight) => insight.timeframe === timeframe);
}
