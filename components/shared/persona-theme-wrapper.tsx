"use client";

import { usePersonaTheme } from "@/lib/hooks/use-persona-theme";
import type { ReactNode } from "react";

interface PersonaThemeWrapperProps {
  children: ReactNode;
}

/**
 * Wraps the dashboard with persona-specific theme CSS variables
 * Automatically updates when the user switches personas
 */
export function PersonaThemeWrapper({ children }: PersonaThemeWrapperProps) {
  const { cssVars, personaId } = usePersonaTheme();
  
  return (
    <div 
      style={cssVars as React.CSSProperties}
      data-persona={personaId}
      className="transition-colors duration-500"
    >
      {children}
    </div>
  );
}
