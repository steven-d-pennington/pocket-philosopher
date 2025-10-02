# Chat Buddy Mode Feature

## Overview
Add a conversation mode toggle that allows users to switch between structured "Coaching Mode" and casual "Buddy Mode" when conversing with philosophical AI personas. Buddy Mode transforms the conversation from prescriptive coaching into natural, friendly dialogue while maintaining philosophical authenticity.

## Feature Goals
- **Approachability**: Lower the barrier to entry with casual, conversational interactions
- **Flexibility**: Allow users to switch between modes based on their current needs
- **Authenticity**: Maintain each persona's philosophical foundation while adapting tone
- **Continuity**: Preserve conversation context when switching between modes

## User Experience

### Buddy Mode (Default)
- **Tone**: Casual, conversational, like talking to a wise friend
- **Structure**: Natural dialogue flow, no forced structure
- **Length**: Flexible (50-250 words typical)
- **Philosophy**: Organic integration when it naturally fits
- **Action Items**: Optional, only when it makes sense
- **Questions**: More back-and-forth exploration together

### Coaching Mode
- **Tone**: Professional, structured guidance
- **Structure**: Acknowledge → Reflect → Micro-actions
- **Length**: Comprehensive (200-400 words)
- **Philosophy**: Deliberate citations and references
- **Action Items**: Always ends with 2-3 actionable steps
- **Questions**: Rhetorical, for self-examination

### Mode Toggle
- **Location**: Conversation header (next to persona info)
- **Type**: Switch component with clear labels
- **Scope**: Global across all personas
- **Persistence**: Mode preference saved in store
- **Behavior**: Applies to new messages only (doesn't affect history)

### Example Transformations

**Marcus Aurelius - Coaching:**
> "You face a choice between comfort and growth. Remember, the inner citadel remains unshaken when duty calls. Consider: What would virtue have you do in this moment?
>
> Three practices for today: 1) Write an evening reflection on this decision, 2) Visualize yourself choosing the harder path, 3) Journal on what courage means to you now."

**Marcus Aurelius - Buddy:**
> "Yeah, that's a tough spot. Sometimes the path forward isn't about what's easier, it's about what lets you sleep better at night, you know? What's your gut telling you here? Want to talk through what each option would feel like?"

## Technical Architecture

### State Management
- Add `conversationMode: 'buddy' | 'coaching'` to `CoachState`
- Global mode toggle (affects all personas)
- Default to `'buddy'` mode for approachability
- Persist mode preference in Zustand store

### Prompt Engineering
- Create buddy mode system prompts for all 6 personas
- Modify `buildCoachMessages()` to branch based on mode
- Maintain knowledge retrieval for both modes
- Adjust response structure, length, and tone requirements per mode

### UI Components
- Add mode toggle switch to `ConversationHeader`
- Mobile-optimized touch targets
- Optional tooltip explaining mode differences
- Smooth visual transitions between modes

### Conversation Flow
- Mode changes apply to new messages only
- Conversation history preserved across mode switches
- Context maintained (persona remembers previous exchanges)
- No thread splitting required

## Implementation Phases

### Phase 1: State and Store Updates
- Add `conversationMode` field to coach store
- Implement `toggleMode()` action
- Configure persistence
- Add selectors for current mode

### Phase 2: Prompt Engineering
- Design buddy mode system prompts for all personas
- Create persona-specific style guidelines for buddy mode
- Update `buildCoachMessages()` with mode branching logic
- Adjust knowledge chunk integration for casual tone

### Phase 3: UI Components
- Design and implement mode toggle switch
- Update `ConversationHeader` component
- Add visual indicators (icons, labels)
- Ensure mobile responsiveness

### Phase 4: Hook Integration
- Update `use-coach-conversation` to pass mode to prompt builder
- Ensure smooth mode transitions
- Test context preservation across switches

### Phase 5: Testing and Polish
- Test all 6 personas in both modes
- Verify conversation continuity across mode switches
- Mobile UX testing
- Analytics tracking for mode usage

## Persona Buddy Mode Characteristics

### Marcus Aurelius (Stoic)
- Still grounded and measured, but more casual
- Uses "you know" and conversational markers
- Asks direct questions about feelings and instincts
- References stoic concepts naturally, not academically

### Laozi (Taoist)
- Poetic but relaxed, like chatting over tea
- Shorter, gentler observations
- Nature metaphors feel spontaneous
- More "what if" questions, less prescription

### Simone de Beauvoir (Existentialist)
- Direct and warm, less analytical
- Still challenges assumptions but conversationally
- More solidarity and companionship
- "Let's think through this" rather than "Consider this"

### Epictetus (Discipline)
- Encouraging friend rather than drill sergeant
- "Real talk" and honest check-ins
- Still emphasizes control, but casually
- "What can you actually do about this?" vs. "Here is what you can control"

### Aristotle (Virtue)
- Wise friend rather than professor
- Less formal terminology
- Practical wisdom through conversation
- "Have you thought about..." rather than "One must consider..."

### Plato (Truth Seeker)
- Thoughtful companion on journey
- Socratic questions feel natural, not academic
- Wonder and curiosity rather than teaching
- "What do you think..." rather than "Consider the Forms..."

## Success Metrics
- Mode usage distribution (buddy vs. coaching)
- Message length differences between modes
- User engagement rates per mode
- Mode switch frequency patterns
- User satisfaction feedback

## Risks and Mitigation
- **Risk**: Buddy mode too casual, loses philosophical depth
  - **Mitigation**: Careful prompt engineering to maintain authenticity
- **Risk**: Users don't discover the toggle
  - **Mitigation**: Clear UI placement, optional onboarding tip
- **Risk**: Mode switches feel jarring in conversation
  - **Mitigation**: Context preservation and natural transitions

## Future Enhancements
- Per-persona mode preferences
- Automatic mode suggestions based on conversation context
- "Hybrid" mode with adjustable formality slider
- Mode presets (e.g., "Quick Chat", "Deep Dive", "Action Planning")
