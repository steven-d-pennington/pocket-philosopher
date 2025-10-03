# Persona-Based Dynamic Theming System

## Overview

The Pocket Philosopher app features a unique **persona-based theming system** that dynamically changes the UI/UX based on the user's selected philosophical coach. Each persona (Marcus Aurelius, Laozi, Simone de Beauvoir, Epictetus) has a distinct visual theme that influences colors, typography, decorative elements, and even interaction patterns.

## Architecture

### Core Components

1. **Persona Theme Definitions** (`lib/constants/persona-themes.ts`)
   - Complete theme configuration for each persona
   - Colors, typography, visual styles, personality traits

2. **Theme Hook** (`lib/hooks/use-persona-theme.ts`)
   - React hook to access current persona's theme
   - Automatically updates when user switches personas
   - Provides CSS variables and utility classes

3. **Theme Wrapper** (`components/shared/persona-theme-wrapper.tsx`)
   - Client component that wraps the dashboard
   - Injects CSS custom properties based on active persona
   - Enables smooth theme transitions

4. **Persona Switcher** (`components/shared/persona-switcher.tsx`)
   - UI component for selecting philosophical guide
   - Shows all personas with their themes
   - Visual preview of each persona's style

## The Four Personas

### 1. Marcus Aurelius - The Stoic Strategist

**Philosophy**: Stoicism  
**Theme Colors**: 
- Primary: Deep philosophical blue-grey (`hsl(215 28% 45%)`)
- Accent: Imperial blue (`hsl(210 60% 55%)`)

**Visual Character**:
- Strong, decisive borders (border-2)
- Marble texture overlay
- Bold, duty-focused typography
- Solid icon style

**Decorative Elements**:
- Divider: ⚔ (Roman sword - representing duty)
- Accent: ◆ (Diamond - representing virtue)
- Bullet: ▪ (Square - structure)

**Personality**:
- Tone: Direct and disciplined
- Emphasis: Virtue and duty
- Pace: Steady and purposeful

**Best For**: Users seeking discipline, leadership, and practical wisdom

---

### 2. Laozi - The Taoist Navigator

**Philosophy**: Taoism / Wu Wei  
**Theme Colors**:
- Primary: Serene jade green (`hsl(160 40% 45%)`)
- Accent: Bamboo green (`hsl(140 50% 60%)`)

**Visual Character**:
- Soft, rounded borders (border)
- Bamboo texture overlay
- Flowing, natural typography
- Soft icon style

**Decorative Elements**:
- Divider: ☯ (Yin-yang - representing balance)
- Accent: 〜 (Wave - representing flow)
- Bullet: ◦ (Circle - wholeness)

**Personality**:
- Tone: Gentle and flowing
- Emphasis: Balance and harmony
- Pace: Flowing and natural

**Best For**: Users seeking balance, flow states, and effortless action

---

### 3. Simone de Beauvoir - The Existential Companion

**Philosophy**: Existentialism  
**Theme Colors**:
- Primary: Existential purple (`hsl(280 50% 50%)`)
- Accent: Passionate magenta (`hsl(320 65% 55%)`)

**Visual Character**:
- Left-accent borders (border-l-4)
- Manuscript texture overlay
- Elegant, thoughtful typography
- Elegant icon style

**Decorative Elements**:
- Divider: ✦ (Star - representing possibility)
- Accent: → (Arrow - forward movement)
- Bullet: • (Bullet - clarity)

**Personality**:
- Tone: Thoughtful and empowering
- Emphasis: Choice and freedom
- Pace: Deliberate and reflective

**Best For**: Users exploring meaning, relationships, and personal freedom

---

### 4. Epictetus - The Discipline Coach

**Philosophy**: Stoicism (Practical Focus)  
**Theme Colors**:
- Primary: Disciplined amber/bronze (`hsl(35 75% 45%)`)
- Accent: Focused orange (`hsl(25 85% 55%)`)

**Visual Character**:
- Left accent borders (border-l-2)
- Stone texture overlay
- Sharp, action-oriented typography
- Sharp icon style

**Decorative Elements**:
- Divider: ═ (Double line - representing strength)
- Accent: ▶ (Triangle - representing action)
- Bullet: ▸ (Arrow - direction)

**Personality**:
- Tone: Practical and focused
- Emphasis: Control and discipline
- Pace: Purposeful and quick

**Best For**: Users wanting practical discipline, resilience, and focus

## Technical Implementation

### CSS Custom Properties

Each persona theme injects CSS variables that can be used throughout the app:

```css
--persona-primary: <hsl values>
--persona-primary-light: <hsl values>
--persona-primary-dark: <hsl values>
--persona-accent: <hsl values>
--persona-accent-light: <hsl values>
```

### Using Persona Theme in Components

**1. Access theme in React components:**

```tsx
import { usePersonaTheme } from "@/lib/hooks/use-persona-theme";

export function MyComponent() {
  const { theme, personaId, uiPatterns } = usePersonaTheme();
  
  return (
    <div className="persona-card">
      <span className="persona-accent">{theme.decorative.divider}</span>
      <h2>{theme.name}'s Wisdom</h2>
    </div>
  );
}
```

**2. Use persona-specific CSS classes:**

```tsx
// Card with persona theming
<div className="persona-card p-6">
  {/* Automatically uses persona's primary color for border */}
</div>

// Accent text
<span className="persona-accent">Important text</span>

// Accent background
<div className="persona-accent-bg p-4">Highlighted section</div>

// Gradient background
<div className="persona-gradient-bg">Subtle gradient</div>

// Gradient text
<h1 className="text-gradient-persona">Title</h1>
```

**3. Use persona-specific patterns:**

```tsx
import { usePersonaClasses } from "@/lib/hooks/use-persona-theme";

export function MyComponent() {
  const classes = usePersonaClasses();
  
  return (
    <div>
      <h2 className={classes.heading}>Styled Heading</h2>
      <blockquote className={classes.quote}>Quote</blockquote>
      <button className={classes.buttonPrimary}>Action</button>
    </div>
  );
}
```

### Animation Durations

Each persona has a specific animation pace:

```typescript
marcus: 200ms     // Steady
lao: 400ms        // Flowing (slower)
simone: 300ms     // Deliberate
epictetus: 150ms  // Purposeful (quick)
```

Access in code:
```tsx
const { animationDuration } = usePersonaTheme();

<div style={{ transitionDuration: `${animationDuration}ms` }}>
  Animated content
</div>
```

## Available CSS Classes

### Persona-Themed Classes

| Class | Description |
|-------|-------------|
| `.persona-card` | Card with persona border color and hover effect |
| `.persona-accent` | Text in persona's accent color |
| `.persona-accent-bg` | Background in persona's accent (10% opacity) |
| `.persona-border` | Border in persona's primary color (20% opacity) |
| `.persona-gradient-bg` | Subtle gradient from primary to accent |
| `.text-gradient-persona` | Gradient text effect using persona colors |

### Existing Philosophy Classes (Still Available)

| Class | Description |
|-------|-------------|
| `.philosophy-card` | Base card with general philosophy styling |
| `.parchment-texture` | Subtle paper texture |
| `.philosophy-quote` | Quote styling with decorative elements |
| `.philosophy-divider` | Section divider (use with persona divider symbol) |

## Component Updates

### Components Using Persona Theme

1. ✅ `DashboardPageHeader` - Title uses persona gradient, eyebrow shows persona symbol
2. ✅ `DailyQuote` - Persona colors and symbols
3. ✅ `ReturnScoreTiles` - Persona divider and accent colors
4. ✅ `TodayPageClient` - Includes PersonaSwitcher
5. ✅ `PersonaSwitcher` - Visual persona selection

### Layout Integration

The `PersonaThemeWrapper` is added to the dashboard layout:

```tsx
<PersonaThemeWrapper>
  <div className="dashboard-content">
    {children}
  </div>
</PersonaThemeWrapper>
```

This automatically:
- Injects CSS variables for the active persona
- Updates when persona changes
- Provides smooth 500ms transition between themes

## User Experience

### Switching Personas

When a user switches personas:

1. **Immediate Visual Feedback** (500ms transition)
   - All accent colors smoothly transition
   - Borders update to new persona color
   - Icons change color

2. **Decorative Elements Update**
   - Dividers change symbols (⚔, ☯, ✦, ═)
   - Accent symbols update (◆, 〜, →, ▶)
   - Quote styling adjusts

3. **Typography Feels Different**
   - Marcus: Bold, structured
   - Laozi: Flowing, natural
   - Simone: Elegant, thoughtful
   - Epictetus: Sharp, actionable

4. **Interaction Pace Changes**
   - Animations adjust to persona's pace
   - Feedback timing matches philosophy

## Best Practices

### DO ✅

- Use `persona-accent` for important highlights
- Use `persona-card` for main content cards
- Include persona decorative symbols for section breaks
- Use `usePersonaTheme()` to access current theme
- Respect animation durations for consistency

### DON'T ❌

- Don't hardcode persona-specific colors
- Don't mix philosophy-gold with persona-accent randomly
- Don't create components that only work with one persona
- Don't ignore the persona's personality traits in UX decisions

## Future Enhancements

### Planned Features

1. **Persona-Specific Content**
   - Custom quotes per persona
   - Persona-specific practice recommendations
   - Tailored reflection prompts

2. **Advanced Visual Themes**
   - Persona-specific animations
   - Custom background patterns per persona
   - Unique card layouts

3. **Personality-Driven UX**
   - Marcus: More checklist-oriented
   - Laozi: More visual/ambient
   - Simone: More journaling-focused
   - Epictetus: More metric-driven

4. **Coach Integration**
   - Persona affects coach communication style
   - Different prompt engineering per persona
   - Persona-specific examples and analogies

## Testing Persona Themes

To test persona themes:

1. Go to Today page
2. Find "Choose your companion" section at top
3. Click different personas
4. Observe:
   - Color transitions (500ms)
   - Symbol changes in dividers
   - Border style updates
   - Overall feel/personality shift

## Code Reference

### Hook API

```typescript
const {
  personaId,        // Current persona ID
  theme,            // Full theme object
  cssVars,          // CSS variables object
  uiPatterns,       // UI pattern classes
  animationDuration // Animation timing
} = usePersonaTheme();
```

### Theme Object Structure

```typescript
interface PersonaTheme {
  id: string;
  name: string;
  colors: { primary, primaryLight, primaryDark, accent, accentLight, gradient };
  typography: { headingFont, bodyFont, quoteFont };
  visual: { cardStyle, borderStyle, shadowStyle, textureOverlay, iconStyle };
  personality: { tone, emphasis, pace };
  decorative: { divider, accentSymbol, bulletPoint };
}
```

---

*The persona theming system ensures that Pocket Philosopher is not just a philosophy app, but an immersive experience tailored to each user's philosophical journey.*
