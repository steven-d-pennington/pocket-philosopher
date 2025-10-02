/**
 * Practice Categories
 * 
 * Organize philosophical practices into meaningful categories
 * that help users explore different aspects of their tradition.
 */

export interface PracticeCategory {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji for visual representation
  color: string; // Tailwind color class
}

/**
 * Universal practice categories that apply across philosophical traditions
 */
export const practiceCategories: PracticeCategory[] = [
  {
    id: "mindfulness",
    name: "Mindfulness & Awareness",
    description: "Practices that cultivate present-moment awareness and attention",
    icon: "🧘",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  {
    id: "reflection",
    name: "Reflection & Contemplation",
    description: "Practices for examining thoughts, actions, and patterns",
    icon: "💭",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
  {
    id: "virtue",
    name: "Virtue Development",
    description: "Practices that build character and ethical strength",
    icon: "⚖️",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  {
    id: "resilience",
    name: "Resilience & Strength",
    description: "Practices that build mental and emotional fortitude",
    icon: "💪",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
  {
    id: "connection",
    name: "Connection & Compassion",
    description: "Practices for relating to others and cultivating empathy",
    icon: "🤝",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
  {
    id: "simplicity",
    name: "Simplicity & Clarity",
    description: "Practices that reduce complexity and increase focus",
    icon: "✨",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  },
  {
    id: "action",
    name: "Action & Embodiment",
    description: "Practices that translate philosophy into lived experience",
    icon: "🎯",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  },
  {
    id: "wisdom",
    name: "Wisdom & Perspective",
    description: "Practices that cultivate broader understanding and insight",
    icon: "🦉",
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  },
];

/**
 * Get category by ID
 */
export function getCategoryById(categoryId: string): PracticeCategory | undefined {
  return practiceCategories.find((cat) => cat.id === categoryId);
}

/**
 * Get categories relevant to a specific persona
 * Each persona emphasizes different practice categories
 */
export function getCategoriesForPersona(personaId: string): string[] {
  switch (personaId) {
    case "marcus":
      // Marcus emphasizes discipline, virtue, reflection, resilience
      return ["virtue", "reflection", "resilience", "mindfulness", "wisdom"];
    case "lao":
      // Laozi emphasizes simplicity, flow, awareness, naturalness
      return ["simplicity", "mindfulness", "wisdom", "action", "connection"];
    case "simone":
      // Simone emphasizes action, authenticity, relationships, choice
      return ["action", "connection", "reflection", "virtue", "wisdom"];
    case "epictetus":
      // Epictetus emphasizes discipline, resilience, control, practice
      return ["resilience", "virtue", "mindfulness", "wisdom", "action"];
    default:
      return ["mindfulness", "reflection", "virtue", "resilience"];
  }
}

/**
 * Get practices organized by category
 * This can be used to display practices in a categorized view
 */
export interface CategorizedPractices {
  category: PracticeCategory;
  practiceIds: string[];
}
