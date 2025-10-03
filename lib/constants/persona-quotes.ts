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
  {
    text: "It is not death that a man should fear, but he should fear never beginning to live.",
    author: "Marcus Aurelius",
    tradition: "Stoicism",
    theme: "courage",
  },
  {
    text: "Look back over the past, with its changing empires that rose and fell, and you can foresee the future too.",
    author: "Marcus Aurelius",
    tradition: "Stoicism",
    theme: "perspective",
  },
  {
    text: "Dwell on the beauty of life. Watch the stars, and see yourself running with them.",
    author: "Marcus Aurelius",
    tradition: "Stoicism",
    theme: "wonder",
  },
  {
    text: "Everything we hear is an opinion, not a fact. Everything we see is a perspective, not the truth.",
    author: "Marcus Aurelius",
    tradition: "Stoicism",
    theme: "epistemology",
  },
  {
    text: "The soul becomes dyed with the color of its thoughts.",
    author: "Marcus Aurelius",
    tradition: "Stoicism",
    theme: "mindfulness",
  },
  {
    text: "How much more grievous are the consequences of anger than the causes of it.",
    author: "Marcus Aurelius",
    tradition: "Stoicism",
    theme: "temperance",
  },
  {
    text: "The object of life is not to be on the side of the majority, but to escape finding oneself in the ranks of the insane.",
    author: "Marcus Aurelius",
    tradition: "Stoicism",
    theme: "wisdom",
  },
  {
    text: "Begin each day by telling yourself: Today I shall be meeting with interference, ingratitude, insolence, disloyalty, ill-will, and selfishness.",
    author: "Marcus Aurelius",
    tradition: "Stoicism",
    theme: "preparation",
  },
  {
    text: "Be like the cliff against which the waves continually break; but it stands firm and tames the fury of the water around it.",
    author: "Marcus Aurelius",
    tradition: "Stoicism",
    theme: "resilience",
  },
  {
    text: "Never let the future disturb you. You will meet it, if you have to, with the same weapons of reason which today arm you against the present.",
    author: "Marcus Aurelius",
    tradition: "Stoicism",
    theme: "equanimity",
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
  {
    text: "Care about what other people think and you will always be their prisoner.",
    author: "Laozi",
    tradition: "Taoism",
    theme: "freedom",
  },
  {
    text: "He who knows others is wise; he who knows himself is enlightened.",
    author: "Laozi",
    tradition: "Taoism",
    theme: "self-knowledge",
  },
  {
    text: "In dwelling, live close to the ground. In thinking, keep to the simple.",
    author: "Laozi",
    tradition: "Taoism",
    theme: "simplicity",
  },
  {
    text: "The flame that burns twice as bright burns half as long.",
    author: "Laozi",
    tradition: "Taoism",
    theme: "balance",
  },
  {
    text: "When you are content to be simply yourself and don't compare or compete, everybody will respect you.",
    author: "Laozi",
    tradition: "Taoism",
    theme: "authenticity",
  },
  {
    text: "Life is a series of natural and spontaneous changes. Don't resist them; that only creates sorrow.",
    author: "Laozi",
    tradition: "Taoism",
    theme: "acceptance",
  },
  {
    text: "Do you have the patience to wait till your mud settles and the water is clear?",
    author: "Laozi",
    tradition: "Taoism",
    theme: "clarity",
  },
  {
    text: "The Tao that can be told is not the eternal Tao. The name that can be named is not the eternal name.",
    author: "Laozi",
    tradition: "Taoism",
    theme: "mystery",
  },
  {
    text: "Those who know do not speak. Those who speak do not know.",
    author: "Laozi",
    tradition: "Taoism",
    theme: "silence",
  },
  {
    text: "At the center of your being you have the answer; you know who you are and you know what you want.",
    author: "Laozi",
    tradition: "Taoism",
    theme: "intuition",
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
  {
    text: "I wish that every human life might be pure transparent freedom.",
    author: "Simone de Beauvoir",
    tradition: "Existentialism",
    theme: "liberation",
  },
  {
    text: "Few tasks are more like the torture of Sisyphus than housework, with its endless repetition.",
    author: "Simone de Beauvoir",
    tradition: "Existentialism",
    theme: "labor",
  },
  {
    text: "What is an adult? A child blown up by age.",
    author: "Simone de Beauvoir",
    tradition: "Existentialism",
    theme: "maturity",
  },
  {
    text: "Man is defined as a human being and woman as a female—whenever she behaves as a human being she is said to imitate the male.",
    author: "Simone de Beauvoir",
    tradition: "Existentialism",
    theme: "equality",
  },
  {
    text: "The body is not a thing, it is a situation: it is our grasp on the world and our sketch of our project.",
    author: "Simone de Beauvoir",
    tradition: "Existentialism",
    theme: "embodiment",
  },
  {
    text: "To lose confidence in one's body is to lose confidence in oneself.",
    author: "Simone de Beauvoir",
    tradition: "Existentialism",
    theme: "confidence",
  },
  {
    text: "Why one man rather than another? It was odd. You find yourself involved with a fellow for life just because he was the one that you met when you were nineteen.",
    author: "Simone de Beauvoir",
    tradition: "Existentialism",
    theme: "contingency",
  },
  {
    text: "Defending the truth is not something one does out of a sense of duty or to allay guilt complexes, but is a reward in itself.",
    author: "Simone de Beauvoir",
    tradition: "Existentialism",
    theme: "truth",
  },
  {
    text: "In itself, homosexuality is as limiting as heterosexuality: the ideal should be to be capable of loving a woman or a man; either, a human being, without feeling fear, restraint, or obligation.",
    author: "Simone de Beauvoir",
    tradition: "Existentialism",
    theme: "love",
  },
  {
    text: "Society, being codified by man, decrees that woman is inferior; she can do away with this inferiority only by destroying the male's superiority.",
    author: "Simone de Beauvoir",
    tradition: "Existentialism",
    theme: "society",
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
  {
    text: "Any person capable of angering you becomes your master.",
    author: "Epictetus",
    tradition: "Stoicism",
    theme: "mastery",
  },
  {
    text: "Demand not that events should happen as you wish; but wish them to happen as they do happen, and you will go on well.",
    author: "Epictetus",
    tradition: "Stoicism",
    theme: "acceptance",
  },
  {
    text: "To accuse others for one's own misfortune is a sign of want of education. To accuse oneself shows that one's education has begun. To accuse neither oneself nor others shows that one's education is complete.",
    author: "Epictetus",
    tradition: "Stoicism",
    theme: "responsibility",
  },
  {
    text: "Men are disturbed not by things, but by the views which they take of them.",
    author: "Epictetus",
    tradition: "Stoicism",
    theme: "perception",
  },
  {
    text: "How long are you going to wait before you demand the best for yourself?",
    author: "Epictetus",
    tradition: "Stoicism",
    theme: "urgency",
  },
  {
    text: "Only the educated are free.",
    author: "Epictetus",
    tradition: "Stoicism",
    theme: "education",
  },
  {
    text: "There is only one way to happiness and that is to cease worrying about things which are beyond the power of our will.",
    author: "Epictetus",
    tradition: "Stoicism",
    theme: "serenity",
  },
  {
    text: "Circumstances don't make the man, they only reveal him to himself.",
    author: "Epictetus",
    tradition: "Stoicism",
    theme: "character",
  },
  {
    text: "First learn the meaning of what you say, and then speak.",
    author: "Epictetus",
    tradition: "Stoicism",
    theme: "wisdom",
  },
  {
    text: "If anyone tells you that a certain person speaks ill of you, do not make excuses about what is said of you but answer, 'He was ignorant of my other faults, else he would not have mentioned these alone.'",
    author: "Epictetus",
    tradition: "Stoicism",
    theme: "humility",
  },
];

/**
 * Get quotes for a specific persona
 */export const aristotleQuotes: Quote[] = [
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act but a habit.",
    author: "Aristotle",
    tradition: "Aristotelian",
    theme: "habits",
  },
  {
    text: "Knowing yourself is the beginning of all wisdom.",
    author: "Aristotle",
    tradition: "Aristotelian",
    theme: "self-knowledge",
  },
  {
    text: "It is the mark of an educated mind to be able to entertain a thought without accepting it.",
    author: "Aristotle",
    tradition: "Aristotelian",
    theme: "reason",
  },
  {
    text: "The whole is greater than the sum of its parts.",
    author: "Aristotle",
    tradition: "Aristotelian",
    theme: "systems",
  },
  {
    text: "Pleasure in the job puts perfection in the work.",
    author: "Aristotle",
    tradition: "Aristotelian",
    theme: "craft",
  },
  {
    text: "The aim of the wise is not to secure pleasure, but to avoid pain.",
    author: "Aristotle",
    tradition: "Aristotelian",
    theme: "temperance",
  },
  {
    text: "Courage is the first of human qualities because it is the quality which guarantees the others.",
    author: "Aristotle",
    tradition: "Aristotelian",
    theme: "courage",
  },
  {
    text: "Educating the mind without educating the heart is no education at all.",
    author: "Aristotle",
    tradition: "Aristotelian",
    theme: "education",
  },
  {
    text: "Quality is not an act, it is a habit.",
    author: "Aristotle",
    tradition: "Aristotelian",
    theme: "quality",
  },
  {
    text: "Happiness depends upon ourselves.",
    author: "Aristotle",
    tradition: "Aristotelian",
    theme: "eudaimonia",
  },
  {
    text: "Hope is a waking dream.",
    author: "Aristotle",
    tradition: "Aristotelian",
    theme: "hope",
  },
  {
    text: "The energy of the mind is the essence of life.",
    author: "Aristotle",
    tradition: "Aristotelian",
    theme: "mind",
  },
];

export const platoQuotes: Quote[] = [
  {
    text: "The first and greatest victory is to conquer yourself.",
    author: "Plato",
    tradition: "Platonism",
    theme: "self-mastery",
  },
  {
    text: "The measure of a man is what he does with power.",
    author: "Plato",
    tradition: "Platonism",
    theme: "justice",
  },
  {
    text: "Wise men speak because they have something to say; fools because they have to say something.",
    author: "Plato",
    tradition: "Platonism",
    theme: "speech",
  },
  {
    text: "The beginning is the most important part of the work.",
    author: "Plato",
    tradition: "Platonism",
    theme: "initiative",
  },
  {
    text: "Opinion is the medium between knowledge and ignorance.",
    author: "Plato",
    tradition: "Platonism",
    theme: "epistemology",
  },
  {
    text: "Music gives a soul to the universe, wings to the mind, flight to the imagination, and life to everything.",
    author: "Plato",
    tradition: "Platonism",
    theme: "inspiration",
  },
  {
    text: "Courage is knowing what not to fear.",
    author: "Plato",
    tradition: "Platonism",
    theme: "courage",
  },
  {
    text: "Human behavior flows from three main sources: desire, emotion, and knowledge.",
    author: "Plato",
    tradition: "Platonism",
    theme: "psychology",
  },
  {
    text: "An empty vessel makes the loudest sound, so they that have the least wit are the greatest babblers.",
    author: "Plato",
    tradition: "Platonism",
    theme: "humility",
  },
  {
    text: "The greatest wealth is to live content with little.",
    author: "Plato",
    tradition: "Platonism",
    theme: "simplicity",
  },
  {
    text: "Necessity is the mother of invention.",
    author: "Plato",
    tradition: "Platonism",
    theme: "innovation",
  },
  {
    text: "Justice means minding your own business and not meddling with other men's concerns.",
    author: "Plato",
    tradition: "Platonism",
    theme: "justice",
  },
];


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
    case "aristotle":
      return aristotleQuotes;
    case "plato":
      return platoQuotes;
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
