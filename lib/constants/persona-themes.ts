/**
 * Persona Theme Configuration
 * 
 * Each philosophical coach persona has a unique visual theme that influences
 * the entire UI/UX to create an immersive, persona-specific experience.
 */

export interface PersonaTheme {
  id: string;
  name: string;
  
  // Color palette
  colors: {
    primary: string;          // Main theme color
    primaryLight: string;     // Lighter variant
    primaryDark: string;      // Darker variant
    accent: string;           // Secondary accent
    accentLight: string;      // Lighter accent
    gradient: string;         // Gradient definition
  };
  
  // Typography
  typography: {
    headingFont: string;      // Font for headings
    bodyFont: string;         // Font for body text
    quoteFont: string;        // Font for quotes
  };
  
  // Visual elements
  visual: {
    cardStyle: string;        // Card appearance style
    borderStyle: string;      // Border treatment
    shadowStyle: string;      // Shadow intensity
    textureOverlay: string;   // Background texture
    iconStyle: string;        // Icon appearance
  };
  
  // Personality traits
  personality: {
    tone: string;             // Communication tone
    emphasis: string;         // What to emphasize
    pace: string;             // UI animation speed
  };
  
  // Decorative elements
  decorative: {
    divider: string;          // Section divider symbol
    accentSymbol: string;     // Accent character
    bulletPoint: string;      // List bullet style
  };
}

export const personaThemes: Record<string, PersonaTheme> = {
  marcus: {
    id: "marcus",
    name: "Marcus Aurelius",
    
    colors: {
      primary: "215 28% 45%",           // Deep philosophical blue-grey
      primaryLight: "215 28% 65%",
      primaryDark: "215 35% 25%",
      accent: "210 60% 55%",            // Imperial blue
      accentLight: "210 60% 75%",
      gradient: "linear-gradient(135deg, hsl(215 28% 45% / 0.1) 0%, hsl(210 60% 55% / 0.05) 100%)",
    },
    
    typography: {
      headingFont: "'Crimson Pro', Georgia, serif",
      bodyFont: "'Inter', sans-serif",
      quoteFont: "'Cormorant', Georgia, serif",
    },
    
    visual: {
      cardStyle: "rounded-xl border-primary/20 shadow-lg",
      borderStyle: "border-2",
      shadowStyle: "shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
      textureOverlay: "marble",
      iconStyle: "solid",
    },
    
    personality: {
      tone: "Direct and disciplined",
      emphasis: "Virtue and duty",
      pace: "steady",
    },
    
    decorative: {
      divider: "⚔",              // Roman sword
      accentSymbol: "◆",         // Diamond (duty)
      bulletPoint: "▪",          // Square
    },
  },
  
  lao: {
    id: "lao",
    name: "Laozi",
    
    colors: {
      primary: "160 40% 45%",           // Serene jade green
      primaryLight: "160 40% 65%",
      primaryDark: "160 50% 25%",
      accent: "140 50% 60%",            // Bamboo green
      accentLight: "140 50% 80%",
      gradient: "linear-gradient(135deg, hsl(160 40% 45% / 0.08) 0%, hsl(140 50% 60% / 0.04) 100%)",
    },
    
    typography: {
      headingFont: "'Crimson Pro', Georgia, serif",
      bodyFont: "'Inter', sans-serif",
      quoteFont: "'Cormorant', Georgia, serif",
    },
    
    visual: {
      cardStyle: "rounded-2xl border-primary/15 shadow-md",
      borderStyle: "border",
      shadowStyle: "shadow-[0_4px_20px_rgb(0,0,0,0.08)]",
      textureOverlay: "bamboo",
      iconStyle: "soft",
    },
    
    personality: {
      tone: "Gentle and flowing",
      emphasis: "Balance and harmony",
      pace: "flowing",
    },
    
    decorative: {
      divider: "☯",              // Yin-yang
      accentSymbol: "〜",         // Wave (flow)
      bulletPoint: "◦",          // Circle
    },
  },
  
  simone: {
    id: "simone",
    name: "Simone de Beauvoir",
    
    colors: {
      primary: "280 50% 50%",           // Existential purple
      primaryLight: "280 50% 70%",
      primaryDark: "280 60% 30%",
      accent: "320 65% 55%",            // Passionate magenta
      accentLight: "320 65% 75%",
      gradient: "linear-gradient(135deg, hsl(280 50% 50% / 0.1) 0%, hsl(320 65% 55% / 0.06) 100%)",
    },
    
    typography: {
      headingFont: "'Crimson Pro', Georgia, serif",
      bodyFont: "'Inter', sans-serif",
      quoteFont: "'Cormorant', Georgia, serif",
    },
    
    visual: {
      cardStyle: "rounded-2xl border-primary/20 shadow-lg",
      borderStyle: "border-l-4",
      shadowStyle: "shadow-[0_6px_25px_rgb(0,0,0,0.1)]",
      textureOverlay: "manuscript",
      iconStyle: "elegant",
    },
    
    personality: {
      tone: "Thoughtful and empowering",
      emphasis: "Choice and freedom",
      pace: "deliberate",
    },
    
    decorative: {
      divider: "✦",              // Star (possibility)
      accentSymbol: "→",         // Arrow (forward)
      bulletPoint: "•",          // Bullet
    },
  },
  
  epictetus: {
    id: "epictetus",
    name: "Epictetus",
    
    colors: {
      primary: "35 75% 45%",            // Disciplined amber/bronze
      primaryLight: "35 75% 65%",
      primaryDark: "35 80% 30%",
      accent: "25 85% 55%",             // Focused orange
      accentLight: "25 85% 75%",
      gradient: "linear-gradient(135deg, hsl(35 75% 45% / 0.12) 0%, hsl(25 85% 55% / 0.06) 100%)",
    },
    
    typography: {
      headingFont: "'Crimson Pro', Georgia, serif",
      bodyFont: "'Inter', sans-serif",
      quoteFont: "'Cormorant', Georgia, serif",
    },
    
    visual: {
      cardStyle: "rounded-lg border-primary/25 shadow-md",
      borderStyle: "border-l-2",
      shadowStyle: "shadow-[0_4px_20px_rgb(0,0,0,0.1)]",
      textureOverlay: "stone",
      iconStyle: "sharp",
    },
    
    personality: {
      tone: "Practical and focused",
      emphasis: "Control and discipline",
      pace: "purposeful",
    },
    
    decorative: {
      divider: "═",              // Double line (strength)
      accentSymbol: "▶",         // Triangle (action)
      bulletPoint: "▸",          // Arrow
    },
  },
  aristotle: {
    id: "aristotle",
    name: "Aristotle",

    colors: {
      primary: "38 70% 48%",            // Golden balance
      primaryLight: "38 70% 68%",
      primaryDark: "38 75% 30%",
      accent: "210 40% 48%",            // Academy blue
      accentLight: "210 40% 68%",
      gradient: "linear-gradient(135deg, hsl(38 70% 48% / 0.12) 0%, hsl(210 40% 48% / 0.06) 100%)",
    },

    typography: {
      headingFont: "'Crimson Pro', Georgia, serif",
      bodyFont: "'Inter', sans-serif",
      quoteFont: "'Cormorant', Georgia, serif",
    },

    visual: {
      cardStyle: "rounded-xl border-primary/25 shadow-md",
      borderStyle: "border",
      shadowStyle: "shadow-[0_6px_24px_rgb(0,0,0,0.1)]",
      textureOverlay: "parchment",
      iconStyle: "classic",
    },

    personality: {
      tone: "Scholarly and balanced",
      emphasis: "Habit and practical wisdom",
      pace: "steady",
    },

    decorative: {
      divider: "||",             // Golden mean marker
      accentSymbol: "*",          // Guiding star
      bulletPoint: "-",          // Balanced marker
    },
  },
  plato: {
    id: "plato",
    name: "Plato",

    colors: {
      primary: "250 60% 52%",          // Academy violet
      primaryLight: "250 60% 72%",
      primaryDark: "250 65% 32%",
      accent: "200 55% 52%",           // Aegean blue
      accentLight: "200 55% 72%",
      gradient: "linear-gradient(135deg, hsl(250 60% 52% / 0.12) 0%, hsl(200 55% 52% / 0.06) 100%)",
    },

    typography: {
      headingFont: "'Crimson Pro', Georgia, serif",
      bodyFont: "'Inter', sans-serif",
      quoteFont: "'Cormorant', Georgia, serif",
    },

    visual: {
      cardStyle: "rounded-3xl border-primary/20 shadow-lg",
      borderStyle: "border",
      shadowStyle: "shadow-[0_8px_28px_rgb(0,0,0,0.12)]",
      textureOverlay: "starlight",
      iconStyle: "geometric",
    },

    personality: {
      tone: "Curious and dialectical",
      emphasis: "Truth and ideal forms",
      pace: "contemplative",
    },

    decorative: {
      divider: "::",             // Dialogic pause
      accentSymbol: "^",          // Rising insight
      bulletPoint: ">",          // Pointer toward ideals
    },
  },
};

/**
 * Get the theme configuration for a specific persona
 */
export function getPersonaTheme(personaId: string): PersonaTheme {
  return personaThemes[personaId] || personaThemes.marcus;
}

/**
 * Generate CSS custom properties for a persona theme
 */
export function generatePersonaThemeVars(personaId: string): Record<string, string> {
  const theme = getPersonaTheme(personaId);
  
  return {
    '--persona-primary': theme.colors.primary,
    '--persona-primary-light': theme.colors.primaryLight,
    '--persona-primary-dark': theme.colors.primaryDark,
    '--persona-accent': theme.colors.accent,
    '--persona-accent-light': theme.colors.accentLight,
  };
}

/**
 * Persona-specific UI patterns
 */
export const personaUIPatterns = {
  marcus: {
    cardClass: "border-l-4 border-l-primary/60",
    buttonStyle: "font-semibold",
    headingStyle: "font-bold tracking-tight",
    quoteStyle: "border-l-4 border-l-primary/40 pl-4 italic font-serif",
  },
  lao: {
    cardClass: "border border-primary/10",
    buttonStyle: "font-normal",
    headingStyle: "font-semibold tracking-normal",
    quoteStyle: "text-center italic font-serif",
  },
  simone: {
    cardClass: "border-l-2 border-l-accent/50",
    buttonStyle: "font-medium",
    headingStyle: "font-semibold tracking-tight",
    quoteStyle: "border-l-2 border-l-accent/40 pl-4 italic font-serif",
  },
  epictetus: {
    cardClass: "border-l-2 border-l-primary/70",
    buttonStyle: "font-semibold uppercase text-xs",
    headingStyle: "font-bold tracking-wide uppercase",
    quoteStyle: "border-l-2 border-l-primary/50 pl-4 font-medium",
  },
  aristotle: {
    cardClass: "border border-primary/30",
    buttonStyle: "font-semibold tracking-wide",
    headingStyle: "font-serif font-semibold tracking-tight",
    quoteStyle: "border-l-4 border-l-primary/40 pl-4 italic font-serif",
  },
  plato: {
    cardClass: "border border-primary/25",
    buttonStyle: "font-medium uppercase tracking-wide",
    headingStyle: "font-serif font-semibold tracking-tight",
    quoteStyle: "border-l-4 border-l-primary/35 pl-4 italic font-serif",
  },
};

/**
 * Animation speeds based on persona
 */
export const personaAnimationDurations = {
  marcus: 200,      // Steady
  lao: 400,         // Flowing/slower
  simone: 300,      // Deliberate
  epictetus: 150,   // Purposeful/quick
  aristotle: 240,   // Balanced cadence
  plato: 260,       // Reflective tempo
};
