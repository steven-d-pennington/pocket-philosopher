"use client";

import { useMemo } from "react";
import { useCoachStore } from "@/lib/stores/coach-store";
import { 
  getPersonaTheme, 
  generatePersonaThemeVars,
  personaUIPatterns,
  personaAnimationDurations,
  type PersonaTheme 
} from "@/lib/constants/persona-themes";

/**
 * Hook to access the current persona's theme configuration
 * Updates automatically when the user switches personas
 */
export function usePersonaTheme() {
  const activePersonaId = useCoachStore((state) => state.activePersonaId);
  
  const theme = useMemo(() => getPersonaTheme(activePersonaId), [activePersonaId]);
  const cssVars = useMemo(() => generatePersonaThemeVars(activePersonaId), [activePersonaId]);
  const uiPatterns = useMemo(() => personaUIPatterns[activePersonaId as keyof typeof personaUIPatterns] || personaUIPatterns.marcus, [activePersonaId]);
  const animationDuration = useMemo(() => personaAnimationDurations[activePersonaId as keyof typeof personaAnimationDurations] || 200, [activePersonaId]);
  
  return {
    personaId: activePersonaId,
    theme,
    cssVars,
    uiPatterns,
    animationDuration,
  };
}

/**
 * Hook to get persona-specific class names
 */
export function usePersonaClasses() {
  const { theme, uiPatterns } = usePersonaTheme();
  
  return {
    // Card variants
    card: `philosophy-card ${uiPatterns.cardClass}`,
    cardHighlight: `rounded-2xl border bg-gradient-to-br p-6 shadow-philosophy`,
    
    // Typography
    heading: `font-serif ${uiPatterns.headingStyle}`,
    quote: uiPatterns.quoteStyle,
    
    // Buttons
    button: uiPatterns.buttonStyle,
    buttonPrimary: `bg-[hsl(var(--persona-primary))] hover:bg-[hsl(var(--persona-primary-dark))] text-white ${uiPatterns.buttonStyle}`,
    
    // Accent elements
    accent: "text-[hsl(var(--persona-accent))]",
    accentBg: "bg-[hsl(var(--persona-accent)_/_0.1)]",
    
    // Dividers and decorative
    divider: "philosophy-divider",
  };
}

/**
 * Helper to get persona-specific gradient backgrounds
 */
export function usePersonaGradient() {
  const { theme } = usePersonaTheme();
  
  return {
    card: `from-[hsl(${theme.colors.primary}_/_0.08)] to-transparent`,
    cardHighlight: `from-[hsl(${theme.colors.primary}_/_0.12)] via-[hsl(${theme.colors.accent}_/_0.06)] to-transparent`,
    text: `from-[hsl(${theme.colors.primary})] via-[hsl(${theme.colors.accent})] to-[hsl(${theme.colors.primary})]`,
  };
}


