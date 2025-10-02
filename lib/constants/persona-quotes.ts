/**
 * Persona-Specific Daily Quotes
 * 
 * Each philosophical coach has their own curated collection of quotes
 * that reflect their tradition, values, and teaching style.
 */

export interface Quote {
  text: string;
  author: string;
  tradition: string;
  theme?: string; // Optional theme: courage, wisdom, action, etc.
}

/**
 * Marcus Aurelius - The Stoic Strategist
 * Focus: Duty, discipline, leadership, acceptance of fate
 */
export const marcusQuotes: Quote[] = [
  {
    text: "Waste no more time arguing about what a good person should be. Be one.",
    author: "Marcus Aurelius",
    tradition: "Stoicism",
    theme: "action",
  },
  {
    text: "You have power over your mind—not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    tradition: "Stoicism",
    theme: "control",
  },
  {
    text: "The impediment to action advances action. What stands in the way becomes the way.",
    author: "Marcus Aurelius",
    tradition: "Stoicism",
    theme: "obstacles",
  },
  {
    text: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.",
    author: "Marcus Aurelius",
    tradition: "Stoicism",
    theme: "contentment",
  },
  {
    text: "Do not act as if you had ten thousand years to live. Death hangs over you. While you live, while it is in your power, be good.",
    author: "Marcus Aurelius",
    tradition: "Stoicism",
    theme: "mortality",
  },
  {
    text: "If it is not right, do not do it. If it is not true, do not say it.",
    author: "Marcus Aurelius",
    tradition: "Stoicism",
    theme: "integrity",
  },
  {
    text: "The best revenge is not to be like your enemy.",
    author: "Marcus Aurelius",
    tradition: "Stoicism",
    theme: "virtue",
  },
  {
    text: "Confine yourself to the present.",
    author: "Marcus Aurelius",
    tradition: "Stoicism",
    theme: "presence",
  },
  {
    text: "Accept the things to which fate binds you, and love the people with whom fate brings you together.",
    author: "Marcus Aurelius",
    tradition: "Stoicism",
    theme: "acceptance",
  },
  {
    text: "When you arise in the morning, think of what a precious privilege it is to be alive—to breathe, to think, to enjoy, to love.",
    author: "Marcus Aurelius",
    tradition: "Stoicism",
    theme: "gratitude",
  },
];

/**
 * Laozi - The Taoist Navigator
 * Focus: Flow, naturalness, non-action, harmony
 */
export const laoziQuotes: Quote[] = [
  {
    text: "When I let go of what I am, I become what I might be.",
    author: "Laozi",
    tradition: "Taoism",
    theme: "transformation",
  },
  {
    text: "Nature does not hurry, yet everything is accomplished.",
    author: "Laozi",
    tradition: "Taoism",
    theme: "patience",
  },
  {
    text: "The journey of a thousand miles begins with one step.",
    author: "Laozi",
    tradition: "Taoism",
    theme: "beginnings",
  },
  {
    text: "Be content with what you have; rejoice in the way things are. When you realize there is nothing lacking, the whole world belongs to you.",
    author: "Laozi",
    tradition: "Taoism",
    theme: "contentment",
  },
  {
    text: "A good traveler has no fixed plans and is not intent on arriving.",
    author: "Laozi",
    tradition: "Taoism",
    theme: "journey",
  },
  {
    text: "To the mind that is still, the whole universe surrenders.",
    author: "Laozi",
    tradition: "Taoism",
    theme: "stillness",
  },
  {
    text: "The wise man is one who knows what he does not know.",
    author: "Laozi",
    tradition: "Taoism",
    theme: "wisdom",
  },
  {
    text: "Act without doing; work without effort. Think of the small as large and the few as many.",
    author: "Laozi",
    tradition: "Taoism",
    theme: "effortlessness",
  },
  {
    text: "If you realize that all things change, there is nothing you will try to hold on to.",
    author: "Laozi",
    tradition: "Taoism",
    theme: "impermanence",
  },
  {
    text: "The softest things in the world overcome the hardest things in the world.",
    author: "Laozi",
    tradition: "Taoism",
    theme: "softness",
  },
];

/**
 * Simone de Beauvoir - The Existential Companion
 * Focus: Freedom, authenticity, choice, human dignity
 */
export const simoneQuotes: Quote[] = [
  {
    text: "One is not born, but rather becomes, a woman.",
    author: "Simone de Beauvoir",
    tradition: "Existentialism",
    theme: "becoming",
  },
  {
    text: "I am too intelligent, too demanding, and too resourceful for anyone to be able to take charge of me entirely.",
    author: "Simone de Beauvoir",
    tradition: "Existentialism",
    theme: "autonomy",
  },
  {
    text: "The point is not for women simply to take power out of men's hands, since that wouldn't change anything about the world. It's a question precisely of destroying that notion of power.",
    author: "Simone de Beauvoir",
    tradition: "Existentialism",
    theme: "power",
  },
  {
    text: "One's life has value so long as one attributes value to the life of others, by means of love, friendship, and compassion.",
    author: "Simone de Beauvoir",
    tradition: "Existentialism",
    theme: "connection",
  },
  {
    text: "Change your life today. Don't gamble on the future, act now, without delay.",
    author: "Simone de Beauvoir",
    tradition: "Existentialism",
    theme: "action",
  },
  {
    text: "To catch a husband is an art; to hold him is a job.",
    author: "Simone de Beauvoir",
    tradition: "Existentialism",
    theme: "relationships",
  },
  {
    text: "Self-consciousness is not knowledge but a story one tells about oneself.",
    author: "Simone de Beauvoir",
    tradition: "Existentialism",
    theme: "identity",
  },
  {
    text: "Freedom is not the absence of commitments, but the ability to choose—and commit myself to—what is best for me.",
    author: "Simone de Beauvoir",
    tradition: "Existentialism",
    theme: "freedom",
  },
  {
    text: "All oppression creates a state of war.",
    author: "Simone de Beauvoir",
    tradition: "Existentialism",
    theme: "justice",
  },
  {
    text: "The most sympathetic of men never fully comprehend woman's concrete situation.",
    author: "Simone de Beauvoir",
    tradition: "Existentialism",
    theme: "understanding",
  },
];

/**
 * Epictetus - The Discipline Coach
 * Focus: Control, practice, resilience, clear thinking
 */
export const epictetusQuotes: Quote[] = [
  {
    text: "First say to yourself what you would be; and then do what you have to do.",
    author: "Epictetus",
    tradition: "Stoicism",
    theme: "action",
  },
  {
    text: "It's not what happens to you, but how you react to it that matters.",
    author: "Epictetus",
    tradition: "Stoicism",
    theme: "response",
  },
  {
    text: "He who laughs at himself never runs out of things to laugh at.",
    author: "Epictetus",
    tradition: "Stoicism",
    theme: "humility",
  },
  {
    text: "We have two ears and one mouth so that we can listen twice as much as we speak.",
    author: "Epictetus",
    tradition: "Stoicism",
    theme: "listening",
  },
  {
    text: "Wealth consists not in having great possessions, but in having few wants.",
    author: "Epictetus",
    tradition: "Stoicism",
    theme: "simplicity",
  },
  {
    text: "If you want to improve, be content to be thought foolish and stupid.",
    author: "Epictetus",
    tradition: "Stoicism",
    theme: "learning",
  },
  {
    text: "No man is free who is not master of himself.",
    author: "Epictetus",
    tradition: "Stoicism",
    theme: "freedom",
  },
  {
    text: "Don't explain your philosophy. Embody it.",
    author: "Epictetus",
    tradition: "Stoicism",
    theme: "embodiment",
  },
  {
    text: "The key is to keep company only with people who uplift you, whose presence calls forth your best.",
    author: "Epictetus",
    tradition: "Stoicism",
    theme: "community",
  },
  {
    text: "Make the best use of what is in your power, and take the rest as it happens.",
    author: "Epictetus",
    tradition: "Stoicism",
    theme: "control",
  },
];

/**
 * Get quotes for a specific persona
 */
export function getQuotesForPersona(personaId: string): Quote[] {
  switch (personaId) {
    case "marcus":
      return marcusQuotes;
    case "lao":
      return laoziQuotes;
    case "simone":
      return simoneQuotes;
    case "epictetus":
      return epictetusQuotes;
    default:
      return marcusQuotes;
  }
}

/**
 * Get a daily quote for a specific persona
 * Uses date-based seeding for consistency throughout the day
 */
export function getDailyQuote(personaId: string, date: Date = new Date()): Quote {
  const quotes = getQuotesForPersona(personaId);
  const seed = date.getFullYear() * 1000 + date.getMonth() * 50 + date.getDate();
  const index = seed % quotes.length;
  return quotes[index];
}
