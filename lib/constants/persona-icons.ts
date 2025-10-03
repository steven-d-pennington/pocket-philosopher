import type { LucideIcon } from "lucide-react";
import {
  Dumbbell,
  Feather,
  Leaf,
  Scale,
  Shield,
  Sparkles,
  User,
} from "lucide-react";

const PERSONA_ICONS: Record<string, LucideIcon> = {
  marcus: Shield,
  lao: Leaf,
  simone: Feather,
  epictetus: Dumbbell,
  aristotle: Scale,
  plato: Sparkles,
};

export function getPersonaIcon(personaId: string): LucideIcon {
  return PERSONA_ICONS[personaId] ?? User;
}

const PERSONA_ACCENT_TEXT_CLASSES: Record<string, string> = {
  marcus: "text-blue-500",
  lao: "text-emerald-500",
  simone: "text-purple-500",
  epictetus: "text-amber-500",
  aristotle: "text-amber-600",
  plato: "text-indigo-600",
};

export function getPersonaAccentTextClass(personaId: string): string {
  return PERSONA_ACCENT_TEXT_CLASSES[personaId] ?? "text-muted-foreground";
}
