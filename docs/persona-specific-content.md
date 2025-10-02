# Persona-Specific Content System

## Overview

The Pocket Philosopher app now features a comprehensive persona-specific content system that adapts daily quotes, practice recommendations, reflection prompts, and AI coach communication styles based on the selected philosophical companion.

## Architecture

### Content Libraries

Three main content libraries provide persona-specific content:

1. **`lib/constants/persona-quotes.ts`** - Daily philosophical quotes
2. **`lib/constants/persona-practices.ts`** - Practice recommendations
3. **`lib/constants/persona-prompts.ts`** - Reflection prompts

### Date-Based Seeding

All content uses a consistent date-based seeding algorithm to ensure the same content appears for each persona on any given day:

```typescript
const seed = year * 1000 + month * 50 + date;
const index = seed % arrayLength;
```

This approach:
- Ensures daily consistency (same quote/practice all day)
- Changes content each day automatically
- Is deterministic and predictable
- Doesn't require database storage

## Content by Persona

### Marcus Aurelius (Stoic Strategist)

**Philosophy**: Stoicism focused on duty, discipline, and virtue
**Theme**: Command your thoughts, rule your reactions

**Daily Quotes** (10 total):
- Themes: action, discipline, control, virtue, present
- Example: "You have power over your mind—not outside events. Realize this, and you will find strength."

**Practice Recommendations** (6 total):
- Evening Review (Examen) - Daily reflection on virtue
- Premeditatio Malorum - Visualizing challenges
- View from Above - Cosmic perspective meditation
- Virtues Checklist - Daily virtue assessment
- Morning Commander Briefing - Day planning with virtue focus
- Dichotomy of Control Journal - Categorizing concerns

**Reflection Prompts** (15 total - 5 per time):
- Morning: "What virtue will I practice today?", "What challenges might test my character today?"
- Midday: "Am I acting in accordance with reason and virtue?", "What is within my control right now?"
- Evening: "What virtue did I strengthen today?", "Where did I let external events disturb my peace?"

**Communication Style**:
- Measured, commanding language with gentle authority
- References duty, discipline, and the "inner citadel"
- Rhetorical questions: "What would virtue have you do?"
- Imperial imagery: "command your thoughts", "rule your reactions"
- Direct observations: "You face a choice...", "This moment tests..."

### Laozi (Taoist Navigator)

**Philosophy**: Taoism focused on wu wei (effortless action), flow, and naturalness
**Theme**: Flow with change, balance yin and yang

**Daily Quotes** (10 total):
- Themes: flow, simplicity, nature, non-action, balance
- Example: "The softest things in the world overcome the hardest. That which has no substance enters where there is no space."

**Practice Recommendations** (6 total):
- Wu Wei Meditation - Practice effortless being
- Water Contemplation - Learn from water's nature
- Breath Awareness - Follow natural rhythms
- Seasonal Alignment - Harmonize with nature
- Non-Striving Walk - Move without force
- Yin-Yang Balance Check - Assess life balance

**Reflection Prompts** (15 total - 5 per time):
- Morning: "Where might I flow like water today?", "What can I release today?"
- Midday: "Am I forcing or flowing?", "What is the natural way forward?"
- Evening: "Where did I resist the natural flow?", "What unnecessary effort can I release?"

**Communication Style**:
- Soft, poetic language with nature metaphors
- Gentle, open-ended questions
- References wu wei and natural flow
- Paradoxical wisdom: "The softest overcomes the hardest"
- Nature observations: "Water finds its way...", "The reed bends..."
- Suggests rather than prescribes

### Simone de Beauvoir (Existential Companion)

**Philosophy**: Existentialism focused on freedom, authenticity, and ethical responsibility
**Theme**: Craft meaning through action and shared humanity

**Daily Quotes** (10 total):
- Themes: freedom, authenticity, choice, solidarity, becoming
- Example: "One is not born, but rather becomes, a woman. No biological, psychological, or economic fate determines the figure that the human female presents in society."

**Practice Recommendations** (6 total):
- Authentic Choice Journaling - Examine freedom and responsibility
- Solidarity Action - Connect with others
- Bad Faith Audit - Identify self-deception
- Ethical Commitment Review - Align actions with values
- Freedom Mapping - Understand constraints and choices
- Becoming Journal - Document personal evolution

**Reflection Prompts** (15 total - 5 per time):
- Morning: "What freedom will I claim today?", "Who am I choosing to become today?"
- Midday: "Am I living authentically or in bad faith?", "What responsibility am I avoiding?"
- Evening: "What choice defined me today?", "Where did I act in solidarity with others?"

**Communication Style**:
- Direct, intellectually rigorous language with warmth
- Challenges assumptions about freedom and responsibility
- References solidarity, authenticity, and "becoming"
- Acknowledges systemic constraints and personal agency
- Analytical observations: "You describe a situation where..."
- Frames actions as ethical commitments

### Epictetus (Discipline Coach)

**Philosophy**: Stoicism focused on control, discipline, and practical training
**Theme**: Separate what you control from the rest

**Daily Quotes** (10 total):
- Themes: control, practice, discipline, focus, training
- Example: "We cannot choose our external circumstances, but we can always choose how we respond to them."

**Practice Recommendations** (6 total):
- Dichotomy of Control Exercise - Categorize concerns
- Morning Premeditatio - Rehearse challenges
- Voluntary Discomfort - Build resilience
- Attention Training - Focus drills
- Impression Review - Examine judgments
- Control Circle Mapping - Visualize influence

**Reflection Prompts** (15 total - 5 per time):
- Morning: "What is within my control today?", "What challenge will I rehearse mentally?"
- Midday: "Am I focusing on what I can control?", "What impression should I examine?"
- Evening: "Where did I mistake the uncontrollable for the controllable?", "What discipline did I practice today?"

**Communication Style**:
- Crisp, disciplined language like a training coach
- Emphasizes dichotomy of control constantly
- Training and athletic practice metaphors
- Clear, concrete exercises and drills
- Direct assessments: "Here is what you can control..."
- Frames challenges as training: "This is your gymnasium"

## Implementation Details

### Components Using Persona Content

1. **DailyQuote** (`components/dashboard/daily-quote.tsx`)
   - Displays persona-specific daily quote
   - Uses `getDailyQuote(personaId)` from persona-quotes

2. **PersonaSuggestedPractice** (`components/dashboard/persona-suggested-practice.tsx`)
   - Shows daily practice recommendation
   - Uses `getSuggestedPractice(personaId)` from persona-practices
   - Includes rationale, difficulty badge, and quick-add button

3. **ReflectionComposer** (`components/reflections/reflection-composer.tsx`)
   - Shows time-appropriate reflection prompts in sidebar
   - Uses `getSuggestedPrompt(personaId, timeType)` from persona-prompts
   - Adapts prompts to morning/midday/evening

4. **AI Coach System** (`lib/ai/prompts/coach.ts`)
   - Injects persona-specific communication style
   - Uses `getPersonaStyleGuidance(personaId)` for distinct voices
   - Adapts response structure and language patterns

### State Management

The active persona is persisted in localStorage using Zustand's persist middleware:

```typescript
// lib/stores/coach-store.ts
persist(
  immer((set) => ({ /* store implementation */ })),
  {
    name: "coach-store",
    partialize: (state) => ({
      activePersonaId: state.activePersonaId,
    }),
  }
)
```

This ensures the selected persona persists across page refreshes.

## Content Guidelines

### Writing Persona-Specific Quotes

Each quote should:
- Reflect the philosopher's core philosophy
- Use language consistent with their communication style
- Include theme tags for future filtering
- Be 1-3 sentences (under 200 characters preferred)

### Creating Practice Recommendations

Each practice should include:
- **Name**: Clear, specific practice title
- **Description**: What the practice involves (2-3 sentences)
- **Virtue**: Which virtue this practice cultivates
- **Frequency**: Recommended schedule (daily, weekly, etc.)
- **Rationale**: Why this persona recommends it (philosophical grounding)
- **Difficulty**: beginner | intermediate | advanced

### Crafting Reflection Prompts

Each prompt should:
- Match the time of day (morning, midday, evening)
- Reflect the persona's philosophical approach
- Be open-ended but focused
- Include depth level (surface | moderate | deep)
- Optionally tie to a specific virtue

## Testing Checklist

- [ ] Switch between all 4 personas and verify unique daily quotes appear
- [ ] Confirm practice recommendations change per persona
- [ ] Test reflection prompts adapt to morning/midday/evening
- [ ] Verify AI coach uses distinct communication style for each persona
- [ ] Check that persona selection persists after page refresh
- [ ] Ensure content changes daily (test on different dates or adjust seed)
- [ ] Confirm "Add this practice" button pre-fills modal correctly
- [ ] Test all components render correctly with persona theming

## Future Enhancements

1. **User Preferences**: Allow users to favorite certain quotes or practices
2. **Content Rotation**: Track which quotes/practices users have seen to ensure variety
3. **Advanced Filtering**: Filter practices by difficulty, virtue, or time commitment
4. **Custom Content**: Let premium users add their own persona-specific content
5. **Audio Quotes**: Record audio versions of daily quotes in appropriate voices
6. **Prompt History**: Track which reflection prompts resonate most with users
7. **AI Personalization**: Let AI adapt content suggestions based on user progress

## Maintenance

### Adding New Content

To add new quotes, practices, or prompts:

1. Edit the appropriate file in `lib/constants/`
2. Follow the existing structure and TypeScript interfaces
3. Ensure content matches the persona's philosophical tradition
4. Test that the content displays correctly
5. Update this documentation if adding new categories

### Modifying Communication Styles

To adjust AI coach voices:

1. Edit `getPersonaStyleGuidance()` in `lib/ai/prompts/coach.ts`
2. Test with multiple conversation scenarios
3. Ensure style remains distinct from other personas
4. Update examples in this documentation

## Related Documentation

- [Persona Theming System](./persona-theming-system.md)
- [Persona Theming Implementation](./persona-theming-implementation.md)
- [Persona Component Updates](./persona-theming-component-updates.md)
- [Philosophy Design System](./philosophy-design-system.md)
