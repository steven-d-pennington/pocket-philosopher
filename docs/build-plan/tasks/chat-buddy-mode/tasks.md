# Chat Buddy Mode Tasks

## Implementation Progress
- ✅ Phase 1: State Management and Store Updates (Completed)
- ✅ Phase 2: Prompt Engineering and AI Integration (Completed)
- ✅ Phase 3: UI Components and Toggle (Completed)
- ✅ Phase 4: Hook Integration and Message Flow (Completed)
- ✅ Phase 5: Analytics and Tracking (Completed)
- ⏸️ Phase 6: Testing and Quality Assurance (Ready for testing)
- ⏸️ Phase 7: Documentation and Polish (Ready to start)

**Current Status**: Core implementation complete. Feature is functional and ready for testing.

---

## Phase 1: State Management and Store Updates
**Status**: ✅ Completed
**Deliverables**:
- Add `conversationMode: 'buddy' | 'coaching'` to `CoachState` interface
- Implement `toggleMode()` action in coach store
- Configure Zustand persistence for mode preference
- Add selector for current conversation mode
- Set default mode to 'buddy'

**Files to Modify**:
- `lib/stores/coach-store.ts`

**Acceptance Criteria**:
- Mode state persists across page refreshes
- Mode toggle action updates state correctly
- Default mode is 'buddy' for new users
- Store tests pass with new state field

**Time Estimate**: 1-2 hours

---

## Phase 2: Prompt Engineering and AI Integration
**Status**: ✅ Completed
**Deliverables**:
- Create buddy mode system prompts for all 6 personas (Marcus, Laozi, Simone, Epictetus, Aristotle, Plato)
- Add `getPersonaBuddyGuidance()` function with casual style rules
- Modify `buildCoachMessages()` to branch based on conversation mode
- Update coaching mode prompts to be more explicit about structure
- Adjust response length parameters per mode (buddy: 50-250 words, coaching: 200-400 words)

**Files to Modify**:
- `lib/ai/prompts/coach.ts`
- `lib/ai/personas.ts` (if needed for buddy-specific persona traits)

**Acceptance Criteria**:
- All 6 personas have distinct buddy mode personalities
- Buddy mode responses are conversational and natural
- Coaching mode maintains current structured approach
- Knowledge chunks integrate organically in buddy mode
- Response length constraints respected per mode

**Example Buddy Mode Prompts**:
```typescript
// Marcus Buddy Mode
"You're Marcus Aurelius having a casual conversation. You're still stoic and grounded,
but you're talking like a wise friend, not an emperor giving directives. Keep it natural
(50-200 words). Ask questions, show curiosity. Share stoic insights when they fit
organically. Use 'you know', 'I mean', and other conversational markers."
```

**Time Estimate**: 3-4 hours

---

## Phase 3: UI Components and Toggle Switch
**Status**: ✅ Completed
**Deliverables**:
- Design mode toggle switch component
- Add toggle to `ConversationHeader` component
- Implement mobile-optimized switch with touch targets
- Add labels: "💬 Buddy" and "🎓 Coach" (or text-only)
- Optional: Add tooltip explaining mode differences
- Ensure proper styling for light/dark themes

**Files to Modify**:
- `components/marcus/coach-workspace.tsx` (ConversationHeader function)
- Potentially create new `components/ui/mode-toggle.tsx` if reusable

**UI Design**:
```
┌─────────────────────────────────────┐
│  🔵 Marcus Aurelius                 │
│  Stoic Strategist                   │
│                                     │
│  💬 Buddy  ◯━━━━━●  Coach 🎓       │
└─────────────────────────────────────┘
```

**Acceptance Criteria**:
- Toggle visible in conversation header
- Switch is touch-friendly on mobile (min 44x44px)
- Visual feedback on toggle (animation, color change)
- Labels clear and readable
- Works in both light and dark themes
- Toggle state reflects current mode from store

**Time Estimate**: 2-3 hours

---

## Phase 4: Hook Integration and Message Flow
**Status**: ✅ Completed
**Deliverables**:
- ✅ Update `use-coach-conversation` hook to read conversation mode
- ✅ Pass mode parameter to `buildCoachMessages()`
- ✅ Ensure conversation context preserved across mode switches
- ✅ Update API endpoint (`/api/marcus`) to handle mode parameter
- ✅ Test mode transitions don't reset conversation state

**Files Modified**:
- ✅ `lib/hooks/use-coach-conversation.ts` - Read mode from store, pass to API, add to dependencies
- ✅ `app/api/marcus/route.ts` - Added mode to schema, extracted from data, passed to orchestrator
- ✅ `lib/ai/orchestrator.ts` - Added mode to CoachStreamOptions, passed to buildCoachMessages

**Acceptance Criteria**:
- ✅ Mode switches apply to new messages only
- ✅ Previous conversation history preserved
- ✅ Context maintains across mode changes
- ✅ No conversation resets when toggling
- ✅ Backend receives correct mode parameter

**Time Estimate**: 2 hours

---

## Phase 5: Analytics and Tracking
**Status**: ✅ Completed
**Deliverables**:
- ✅ Add analytics event for mode toggle: `coach_mode_changed`
- ✅ Track mode usage per persona
- ✅ Track mode switch frequency patterns
- ⏭️ Monitor message length differences between modes (deferred - can be added later if needed)
- ⏭️ Add to analytics dashboard (deferred - if applicable)

**Files Modified**:
- ✅ `components/marcus/coach-workspace.tsx` - Added `coach_mode_changed` tracking in toggle handler with persona, previous/new mode

**Events to Track**:
```typescript
track('coach_mode_changed', {
  personaId: string,
  previousMode: 'buddy' | 'coaching',
  newMode: 'buddy' | 'coaching',
  messageCount: number, // messages in current conversation
})
```

**Acceptance Criteria**:
- Mode toggle events tracked correctly
- Analytics show mode distribution
- Can segment user behavior by preferred mode
- Dashboard shows mode usage metrics

**Time Estimate**: 1-2 hours

---

## Phase 6: Testing and Quality Assurance
**Status**: Not Started
**Deliverables**:
- Unit tests for coach store mode actions
- Integration tests for mode-aware prompt building
- E2E tests for mode toggle functionality
- Manual testing of all 6 personas in both modes
- Mobile device testing (iOS Safari, Android Chrome)
- Accessibility testing (keyboard navigation, screen reader)

**Files to Create/Modify**:
- `lib/stores/__tests__/coach-store.test.ts`
- `lib/ai/prompts/__tests__/coach.test.ts`
- `e2e/specs/coach-buddy-mode.spec.ts`

**Test Scenarios**:
- Toggle switches mode and persists
- Buddy mode responses are casual and conversational
- Coaching mode responses are structured with action items
- Context preserved across mode switches
- All personas have distinct buddy personalities
- Mobile toggle works on touch devices
- Keyboard navigation works for toggle

**Acceptance Criteria**:
- All tests passing
- No regressions in existing coach functionality
- Mobile UX smooth and responsive
- Accessibility standards met (WCAG AA)
- No console errors or warnings

**Time Estimate**: 3-4 hours

---

## Phase 7: Documentation and Polish
**Status**: Not Started
**Deliverables**:
- Update user-facing documentation about buddy mode
- Add code comments explaining mode logic
- Create internal guide for future persona buddy mode creation
- Add mode explanation to in-app help/onboarding (optional)
- Review and refine buddy mode prompts based on testing

**Files to Create/Modify**:
- `docs/features/chat-buddy-mode.md` (user guide)
- `docs/development/persona-prompt-guide.md` (dev guide)
- Inline code comments in modified files

**Acceptance Criteria**:
- Clear documentation for users
- Developer guide for adding new personas with buddy mode
- Code is well-commented and maintainable
- No ambiguity about how modes work

**Time Estimate**: 2 hours

---

## Total Estimated Time: 14-19 hours

## Dependencies
- Phase 2 depends on Phase 1 (need state before prompts can use it)
- Phase 4 depends on Phases 1-3 (state, prompts, and UI needed)
- Phase 6 depends on Phases 1-5 (test everything)
- Phase 7 can run parallel to Phase 6

## Rollout Strategy
1. **Local Development**: Complete all phases in local environment
2. **Staging Deployment**: Test with internal team members
3. **Beta Testing**: Optional limited rollout to subset of users
4. **Production Deployment**: Full rollout with monitoring
5. **Monitoring**: Track mode usage, response quality, user feedback
6. **Iteration**: Refine prompts based on real-world usage

## Success Metrics Post-Launch
- Mode usage split (target: 60% buddy, 40% coaching initially)
- User retention when buddy mode is available
- Average conversation length in buddy vs. coaching mode
- Mode switch frequency (indicates user finding value in both)
- Qualitative feedback on conversation naturalness
