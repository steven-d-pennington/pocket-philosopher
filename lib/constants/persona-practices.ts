/**
 * Persona-Specific Practice Recommendations
 * 
 * Each philosophical coach recommends practices aligned with their tradition.
 * These recommendations help users develop habits that embody their chosen philosophy.
 */

export interface PracticeRecommendation {
  name: string;
  description: string;
  virtue: string;
  frequency: "daily" | "weekly" | "custom";
  rationale: string; // Why this persona recommends this practice
  difficulty: "beginner" | "intermediate" | "advanced";
}

/**
 * Marcus Aurelius - The Stoic Strategist
 * Emphasis: Discipline, duty, leadership, self-examination
 */
export const marcusPractices: PracticeRecommendation[] = [
  {
    name: "Morning Meditation on Death",
    description: "Contemplate mortality to clarify priorities and act with urgency",
    virtue: "Wisdom",
    frequency: "daily",
    rationale: "Marcus believed that remembering death sharpens our focus on what truly matters and prevents wasting time on trivialities.",
    difficulty: "intermediate",
  },
  {
    name: "Evening Review (Examen)",
    description: "Review the day's actions: what went well, what could improve, what to practice tomorrow",
    virtue: "Temperance",
    frequency: "daily",
    rationale: "A core Stoic practice. Marcus used his evening hours to examine his choices and recommit to virtue.",
    difficulty: "beginner",
  },
  {
    name: "View from Above",
    description: "Visualize yourself from a cosmic perspective to gain equanimity",
    virtue: "Wisdom",
    frequency: "weekly",
    rationale: "Marcus frequently reminded himself of his small place in the universe to maintain humility and perspective.",
    difficulty: "advanced",
  },
  {
    name: "Premeditation of Adversity",
    description: "Imagine worst-case scenarios to build resilience and acceptance",
    virtue: "Courage",
    frequency: "weekly",
    rationale: "By contemplating difficulties in advance, Marcus prepared himself to face them with strength and clarity.",
    difficulty: "intermediate",
  },
  {
    name: "Service to the Common Good",
    description: "Dedicate time to helping others or contributing to community welfare",
    virtue: "Justice",
    frequency: "weekly",
    rationale: "As emperor, Marcus saw service as the highest calling. He believed we are born to work together for the common good.",
    difficulty: "beginner",
  },
  {
    name: "Control Dichotomy Practice",
    description: "List what's in your control vs. not; focus energy only on the former",
    virtue: "Wisdom",
    frequency: "daily",
    rationale: "The fundamental Stoic principle: distinguish what you can control from what you cannot, and let go of the latter.",
    difficulty: "beginner",
  },
];

/**
 * Laozi - The Taoist Navigator
 * Emphasis: Flow, naturalness, non-striving, balance
 */
export const laoziPractices: PracticeRecommendation[] = [
  {
    name: "Wu Wei Meditation",
    description: "Practice effortless action by observing how things naturally unfold without forcing",
    virtue: "Wisdom",
    frequency: "daily",
    rationale: "Laozi taught that the highest action is non-action—letting things happen naturally rather than forcing outcomes.",
    difficulty: "advanced",
  },
  {
    name: "Morning Stillness",
    description: "Sit in silence and observe the breath, allowing thoughts to pass like clouds",
    virtue: "Temperance",
    frequency: "daily",
    rationale: "Stillness reveals the Tao. Laozi emphasized quieting the mind to perceive the natural order beneath chaos.",
    difficulty: "beginner",
  },
  {
    name: "Nature Immersion",
    description: "Spend time in nature, observing its rhythms and learning from its effortless growth",
    virtue: "Wisdom",
    frequency: "weekly",
    rationale: "Nature embodies the Tao—it acts without effort, grows without striving, and accomplishes everything.",
    difficulty: "beginner",
  },
  {
    name: "Practice Yielding",
    description: "In conflicts or challenges, practice being like water: soft, adaptable, yet persistent",
    virtue: "Temperance",
    frequency: "daily",
    rationale: "Laozi said the softest things overcome the hardest. Yielding is not weakness but supreme strength.",
    difficulty: "intermediate",
  },
  {
    name: "Simplify Your Life",
    description: "Remove one unnecessary thing, obligation, or commitment each week",
    virtue: "Temperance",
    frequency: "weekly",
    rationale: "Laozi advocated for simplicity: 'Be content with what you have; rejoice in the way things are.'",
    difficulty: "beginner",
  },
  {
    name: "Observe the Paradoxes",
    description: "Contemplate how opposites create each other: light/dark, hard/soft, full/empty",
    virtue: "Wisdom",
    frequency: "weekly",
    rationale: "Understanding complementary opposites reveals the Tao. Laozi taught that one cannot exist without the other.",
    difficulty: "intermediate",
  },
];

/**
 * Simone de Beauvoir - The Existential Companion
 * Emphasis: Freedom, authenticity, responsibility, consciousness
 */
export const simonePractices: PracticeRecommendation[] = [
  {
    name: "Authentic Choice Journaling",
    description: "Reflect on a recent decision: Did you choose freely or follow convention?",
    virtue: "Courage",
    frequency: "daily",
    rationale: "Simone believed authenticity requires constant self-examination to distinguish our genuine choices from societal conditioning.",
    difficulty: "intermediate",
  },
  {
    name: "Project Yourself Forward",
    description: "Envision who you want to become and take one concrete step toward that person",
    virtue: "Courage",
    frequency: "daily",
    rationale: "Existentialism insists we are not fixed—we create ourselves through our choices and projects.",
    difficulty: "beginner",
  },
  {
    name: "Engage with the Other",
    description: "Have a genuine conversation where you truly try to understand another's experience",
    virtue: "Justice",
    frequency: "weekly",
    rationale: "Simone emphasized that we discover ourselves through authentic engagement with others, especially across difference.",
    difficulty: "intermediate",
  },
  {
    name: "Examine Your Freedom",
    description: "Identify one area where you feel constrained and explore if the constraint is real or self-imposed",
    virtue: "Courage",
    frequency: "weekly",
    rationale: "Simone argued that we often hide from our freedom. Recognizing it is the first step to embracing it.",
    difficulty: "advanced",
  },
  {
    name: "Challenge an Assumption",
    description: "Question one belief you hold about yourself or the world; examine its origins",
    virtue: "Wisdom",
    frequency: "weekly",
    rationale: "Critical consciousness was central to Simone's philosophy. We must interrogate the stories we've been told.",
    difficulty: "intermediate",
  },
  {
    name: "Act in Bad Faith, Consciously",
    description: "Notice moments when you deny your freedom or responsibility; name them",
    virtue: "Courage",
    frequency: "daily",
    rationale: "Simone believed awareness of our bad faith is the path to authenticity. We must see our self-deceptions clearly.",
    difficulty: "advanced",
  },
];

/**
 * Epictetus - The Discipline Coach
 * Emphasis: Control, practice, resilience, action
 */
export const epictetusPractices: PracticeRecommendation[] = [
  {
    name: "Morning Preparation",
    description: "Plan your day with the mindset: 'I may encounter the unkind today. I will not be disturbed.'",
    virtue: "Temperance",
    frequency: "daily",
    rationale: "Epictetus taught that we should prepare for adversity so we're not caught off guard by human nature.",
    difficulty: "beginner",
  },
  {
    name: "Dichotomy of Control Exercise",
    description: "Before any action, ask: 'Is this in my control?' If not, release attachment to outcome",
    virtue: "Wisdom",
    frequency: "daily",
    rationale: "This is the cornerstone of Epictetus's teaching: focus only on what's in your power—your choices and judgments.",
    difficulty: "beginner",
  },
  {
    name: "Voluntary Discomfort",
    description: "Choose mild hardship (cold shower, skip a meal, uncomfortable position) to build resilience",
    virtue: "Courage",
    frequency: "weekly",
    rationale: "Epictetus advocated for training through discomfort: 'Difficulties show men what they are made of.'",
    difficulty: "intermediate",
  },
  {
    name: "Negative Visualization",
    description: "Imagine losing something you value to appreciate it more and prepare for loss",
    virtue: "Wisdom",
    frequency: "weekly",
    rationale: "Epictetus warned against taking anything for granted. Contemplating loss builds gratitude and resilience.",
    difficulty: "intermediate",
  },
  {
    name: "Practice Your Principles",
    description: "Choose one virtue to embody today and practice it in every situation",
    virtue: "Temperance",
    frequency: "daily",
    rationale: "Epictetus insisted philosophy is useless without practice: 'Don't explain your philosophy. Embody it.'",
    difficulty: "beginner",
  },
  {
    name: "Reframe Obstacles",
    description: "When facing difficulty, immediately ask: 'How is this an opportunity to practice virtue?'",
    virtue: "Courage",
    frequency: "daily",
    rationale: "Every obstacle is a chance to exercise virtue. Epictetus taught that difficulties are our training ground.",
    difficulty: "intermediate",
  },
];

/**
 * Get practice recommendations for a specific persona
 */export const aristotlePractices: PracticeRecommendation[] = [
  {
    name: "Golden Mean Audit",
    description: "Review a recent decision and identify where excess or deficiency showed up. Sketch a balanced alternative.",
    virtue: "Wisdom",
    frequency: "daily",
    rationale: "Aristotle taught that virtue is found between extremes. Conscious review trains the mind to seek balance.",
    difficulty: "intermediate",
  },
  {
    name: "Virtue Journaling",
    description: "Write three lines on how you expressed a chosen virtue today and where you could adjust tomorrow.",
    virtue: "Practical wisdom",
    frequency: "daily",
    rationale: "Reflection converts knowledge into habit by reinforcing which actions align with excellence.",
    difficulty: "beginner",
  },
  {
    name: "Deliberative Walk",
    description: "Take a short walk while reasoning through an upcoming decision: end, means, and impact on character.",
    virtue: "Practical wisdom",
    frequency: "weekly",
    rationale: "Movement paired with reason clarifies intention and prevents rushed judgments.",
    difficulty: "intermediate",
  },
  {
    name: "Friendship of Excellence",
    description: "Schedule time with someone who challenges you toward the good. Discuss a virtue you both want to strengthen.",
    virtue: "Justice",
    frequency: "weekly",
    rationale: "Noble friendships, according to Aristotle, mirror virtues back to us and accelerate growth.",
    difficulty: "beginner",
  },
  {
    name: "Habit Calibration",
    description: "Choose one habit and adjust it slightly toward moderation-either by reducing excess or adding needed effort.",
    virtue: "Temperance",
    frequency: "weekly",
    rationale: "Small adjustments keep habits anchored in the golden mean rather than drifting toward extremes.",
    difficulty: "intermediate",
  },
  {
    name: "Eudaimonia Planning",
    description: "Outline a project that expresses your highest purpose, then identify the virtues required to complete it.",
    virtue: "Wisdom",
    frequency: "custom",
    rationale: "Flourishing arises when long-term aims and daily actions reinforce each other. Planning links the two.",
    difficulty: "advanced",
  },
];

export const platoPractices: PracticeRecommendation[] = [
  {
    name: "Socratic Self-Dialogue",
    description: "Pose a challenging question to yourself, answer it, and then challenge that answer with a deeper why. Repeat three times.",
    virtue: "Wisdom",
    frequency: "daily",
    rationale: "Plato advanced knowledge through dialectic. Questioning peels away assumptions and reveals clearer insight.",
    difficulty: "intermediate",
  },
  {
    name: "Allegory of the Cave Check",
    description: "Identify one area where you might be mistaking shadows for truth. List evidence that could reveal a deeper reality.",
    virtue: "Truth",
    frequency: "weekly",
    rationale: "Regularly testing appearances keeps you aligned with the pursuit of genuine understanding.",
    difficulty: "intermediate",
  },
  {
    name: "Harmonize the Soul",
    description: "Rate the state of appetite, spirit, and reason on a scale of calm to unruly. Choose one action to restore harmony.",
    virtue: "Temperance",
    frequency: "daily",
    rationale: "Plato held that a just life balances the parts of the soul. Awareness is the first step toward balance.",
    difficulty: "beginner",
  },
  {
    name: "Forms Reflection",
    description: "Spend five minutes contemplating the ideal form of a virtue you need today. Visualize how it would guide your next decision.",
    virtue: "Justice",
    frequency: "daily",
    rationale: "Aligning with higher ideals gives concrete choices a stable reference point.",
    difficulty: "beginner",
  },
  {
    name: "Dialogic Walk",
    description: "Invite a partner for a walking conversation where each person explores a question with open curiosity.",
    virtue: "Wisdom",
    frequency: "weekly",
    rationale: "Shared inquiry was central to Plato's Academy and keeps thinking agile.",
    difficulty: "intermediate",
  },
  {
    name: "Ideal State Sketch",
    description: "Outline what a just outcome would look like in a current challenge. Work backward to identify the practical steps to approach it.",
    virtue: "Justice",
    frequency: "custom",
    rationale: "Imagining the ideal clarifies how present actions can move closer to it.",
    difficulty: "advanced",
  },
];


export function getPracticeRecommendations(personaId: string): PracticeRecommendation[] {
  switch (personaId) {
    case "marcus":
      return marcusPractices;
    case "lao":
      return laoziPractices;
    case "simone":
      return simonePractices;
    case "epictetus":
      return epictetusPractices;
    case "aristotle":
      return aristotlePractices;
    case "plato":
      return platoPractices;
    default:
      return marcusPractices;
  }
}

/**
 * Get a suggested practice for today based on persona
 * Can filter by difficulty or virtue
 */
export function getSuggestedPractice(
  personaId: string,
  options?: {
    difficulty?: "beginner" | "intermediate" | "advanced";
    virtue?: string;
  }
): PracticeRecommendation {
  let practices = getPracticeRecommendations(personaId);

  if (options?.difficulty) {
    practices = practices.filter((p) => p.difficulty === options.difficulty);
  }

  if (options?.virtue) {
    practices = practices.filter((p) => p.virtue === options.virtue);
  }

  const today = new Date();
  const seed = today.getFullYear() * 1000 + today.getMonth() * 50 + today.getDate();
  const index = seed % practices.length;

  return practices[index];
}
