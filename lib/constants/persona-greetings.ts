/**
 * Persona Greeting Messages
 * 
 * Each philosophical coach has personalized greeting messages
 * that set the tone for the coaching conversation.
 */

export interface PersonaGreeting {
  opening: string;
  context: string;
  invitation: string;
}

/**
 * Marcus Aurelius - The Stoic Strategist
 * Tone: Measured, commanding, gentle authority
 */
export const marcusGreetings: PersonaGreeting[] = [
  {
    opening: "Welcome, friend.",
    context: "You stand at the threshold of another day's campaign. Each moment is a chance to practice virtue—to be just, temperate, courageous, and wise.",
    invitation: "What challenge brings you here? Let us examine it together with the clear eyes of reason.",
  },
  {
    opening: "Greetings, traveler.",
    context: "The path of philosophy is not walked once but practiced daily. Like a soldier maintains their weapons, you must sharpen your judgment and strengthen your will.",
    invitation: "What weighs on your mind? Speak freely, and we shall consider it with care.",
  },
  {
    opening: "I see you've returned.",
    context: "Good. Consistency in practice builds the inner citadel that no external fortune can breach. Each conversation is another stone in that fortress.",
    invitation: "What lesson does today present? Share your thoughts, and let us find wisdom together.",
  },
  {
    opening: "You've come seeking guidance.",
    context: "Remember: you already possess the tools—reason, discipline, and virtue. My role is merely to help you recognize what you already know in your best moments.",
    invitation: "What decision troubles you? Let's apply the test of virtue to illuminate the path.",
  },
  {
    opening: "Another day, another opportunity.",
    context: "The Stoic doesn't ask for easy circumstances; they ask for the strength to meet any circumstance with excellence. You're training for life's arena.",
    invitation: "Tell me what you're facing. Together we'll find the virtuous response.",
  },
];

/**
 * Laozi - The Taoist Navigator
 * Tone: Soft, poetic, natural wisdom
 */
export const laoziGreetings: PersonaGreeting[] = [
  {
    opening: "Ah, you've arrived.",
    context: "Like water flowing downhill, you've followed the natural path that led you here. There is no coincidence in timing—only the river of Tao carrying us where we need to be.",
    invitation: "What troubles the surface of your waters? Share, and we'll wait together for the mud to settle.",
  },
  {
    opening: "Welcome, friend.",
    context: "The reed that bends survives the storm. The rigid tree breaks. You're here perhaps because you've been too rigid, or perhaps because you need reminding of your natural flexibility.",
    invitation: "What feels forced in your life? Let's explore the path of effortless action together.",
  },
  {
    opening: "You return to the well.",
    context: "Good. The Tao is like water—always available, always nourishing, never demanding payment. You cannot empty this well by drinking from it.",
    invitation: "What thirst brings you here today? Let's see what the depths have to offer.",
  },
  {
    opening: "The student appears when ready.",
    context: "Not because the teacher calls, but because the natural order arranges things so. Your presence here is part of a larger flow you cannot fully see.",
    invitation: "What question lives in your heart? Ask it, and we'll discover the answer that's already waiting.",
  },
  {
    opening: "Like the morning mist, you've arrived.",
    context: "Quiet and soft, following no particular path yet covering all ground. This is the way of the Tao—present everywhere without forcing itself anywhere.",
    invitation: "What needs to flow through you today? Let's remove the dams that block your natural current.",
  },
];

/**
 * Simone de Beauvoir - The Existential Companion
 * Tone: Direct, intellectually rigorous, warm
 */
export const simoneGreetings: PersonaGreeting[] = [
  {
    opening: "Hello. I'm glad you're here.",
    context: "Philosophy isn't an escape from life—it's the tool we use to engage with life more fully, more authentically, more freely. You've chosen to show up. That itself is a meaningful act.",
    invitation: "What situation demands your attention? Let's examine it together, without illusions.",
  },
  {
    opening: "Welcome back.",
    context: "Each time you return, you're not the same person who left. You're constantly becoming through your choices and actions. This conversation will be part of that becoming.",
    invitation: "What choice are you wrestling with? Remember: not choosing is itself a choice.",
  },
  {
    opening: "You've come seeking clarity.",
    context: "Good. Authenticity requires honesty about our situation—seeing both the constraints we face and the freedom we retain within those constraints.",
    invitation: "What feels confusing or contradictory right now? Let's untangle it together.",
  },
  {
    opening: "I see you.",
    context: "Not as a fixed entity but as a project in progress, constantly writing your own story through your choices. You're both the author and the protagonist of your life.",
    invitation: "What chapter are you writing now? What does authenticity demand of you in this moment?",
  },
  {
    opening: "Another conversation begins.",
    context: "Each conversation is an act of freedom—you're choosing to examine your life, to take responsibility, to become more fully yourself rather than accepting what others have told you to be.",
    invitation: "What story have you been telling yourself? Is it true, or is it time to write a new one?",
  },
];

/**
 * Epictetus - The Discipline Coach
 * Tone: Direct, practical, coach-like
 */
export const epictetusGreetings: PersonaGreeting[] = [
  {
    opening: "You've shown up. Good.",
    context: "Philosophy isn't philosophy if it doesn't change how you live. We're here to train, not to theorize. Like an athlete preparing for competition, you're building strength for life's challenges.",
    invitation: "What are you training for today? Tell me what you're facing, and we'll build a practice.",
  },
  {
    opening: "Back for more training.",
    context: "Excellent. Progress in philosophy is like progress in athletics—consistent practice, small improvements, patient persistence. You don't become a sage overnight any more than you become a champion in a day.",
    invitation: "What skill needs work? Where did you stumble yesterday that we can practice today?",
  },
  {
    opening: "I see you're ready to work.",
    context: "Remember the dichotomy: some things are in your control, some aren't. Your job is to identify which is which and focus all your energy on the first category. Everything else is just noise.",
    invitation: "What's within your control right now? That's what we'll work on.",
  },
  {
    opening: "Another day, another lesson.",
    context: "Life is your training ground. Every difficulty is an opportunity to practice virtue, every frustration a chance to strengthen your discipline. You're not here to avoid challenges but to meet them skillfully.",
    invitation: "What challenge has life presented you? Good. Let's train your response.",
  },
  {
    opening: "You want to improve.",
    context: "Then be willing to fail. Be willing to look foolish. Be willing to admit what you don't know. Progress requires honesty about where you are and humility about where you need to go.",
    invitation: "Where are you struggling? Don't hide it—name it, and we'll address it directly.",
  },
];

/**
 * Get greetings for a specific persona
 */
export function getGreetingsForPersona(personaId: string): PersonaGreeting[] {
  switch (personaId) {
    case "marcus":
      return marcusGreetings;
    case "lao":
      return laoziGreetings;
    case "simone":
      return simoneGreetings;
    case "epictetus":
      return epictetusGreetings;
    default:
      return marcusGreetings;
  }
}

/**
 * Get a specific greeting based on conversation state
 * - First conversation: Use greeting 0
 * - Subsequent: Rotate through other greetings
 */
export function getGreeting(
  personaId: string,
  conversationCount: number = 0,
): PersonaGreeting {
  const greetings = getGreetingsForPersona(personaId);
  
  // First conversation always uses the first greeting
  if (conversationCount === 0) {
    return greetings[0];
  }
  
  // Subsequent conversations rotate through the others
  const index = ((conversationCount - 1) % (greetings.length - 1)) + 1;
  return greetings[index];
}

/**
 * Get a daily greeting (changes daily but consistent throughout the day)
 */
export function getDailyGreeting(personaId: string, date: Date = new Date()): PersonaGreeting {
  const greetings = getGreetingsForPersona(personaId);
  const seed = date.getFullYear() * 1000 + date.getMonth() * 50 + date.getDate();
  const index = seed % greetings.length;
  return greetings[index];
}
