# Frontend Experience Blueprint

This specification outlines how to rebuild the Pocket Philosopher user interface and client-side behavior. It assumes a Next.js 14 + TypeScript stack using the App Router and shadcn/ui. Code snippets are intentionally omitted; focus on structural and behavioral guidance.

## 1. Technology Stack & Conventions
- **Framework:** Next.js 14 App Router with server and client components.
- **Language:** TypeScript with strict mode.
- **Styling:** Tailwind CSS (utility-first) supplemented by shadcn/ui primitives and custom CSS modules when necessary.
- **Icons & Motion:** Lucide icons for visual cues; Framer Motion for subtle entrance and hover animations.
- **State:**
  - Zustand stores in `lib/stores` (auth, daily progress, habits, UI, streaming) with Immer for immutable updates.
  - TanStack Query for async data fetching where caching or background refetch is desired (Supabase RPC, coach responses).
  - Local storage synchronization for offline resilience (morning intentions, unsent reflections, cached habits).
- **Forms & Validation:** Zod schemas under `lib/validation` power form validation via React Hook Form wrappers.
- **Accessibility:** All interactive elements use accessible shadcn/ui components with ARIA labels and keyboard support.

## 2. Directory Structure
```
app/
  (auth)/             -> Login, signup, password reset flows
  (dashboard)/        -> Authenticated shell and feature routes
  api/                -> Backend routes (documented separately)
components/
  ui/                 -> shadcn/ui primitives (Button, Card, Tabs, Dialog, etc.)
  dashboard/          -> Feature-level UI (HabitList, ReturnScoreCard, PersonaSwitch)
  habits/             -> Habit creation dialogs, trackers, suggestion lists
  reflections/        -> Reflection forms, prompt builders, journal timeline
  marcus/             -> Chat UI, message bubbles, persona selectors (legacy folder name retained)
  shared/             -> Layout, navigation, toasts, loaders
lib/
  stores/             -> Zustand stores for client state
  hooks/              -> React hooks for data fetching (Supabase) and UX helpers
  constants/          -> Static data (virtues, philosophy concepts, quotes)
  utils/              -> Formatting utilities, date helpers, offline storage helpers
styles/               -> Tailwind config, global styles, design tokens
```

## 3. Routing & Layouts
- **Public Shell:**
  - Root layout (`app/layout.tsx`) defines fonts, metadata, and global providers (QueryClientProvider, ThemeProvider, Toast provider, service worker registration).
  - `(auth)` segment shares a minimalist layout with hero copy and forms for login/signup. Auth pages redirect to dashboard when user is already authenticated.
- **Authenticated Shell:**
  - `(dashboard)/layout.tsx` wraps pages with top navigation (daily concept summary, coach quick access), side navigation (Today, Habits, Reflections, Marcus, Profile, Settings), and global UI state (philosophy theme, notifications panel).
  - Guard logic uses `useAuthGuard` (Zustand) to redirect unauthenticated users to `/login`. Fallback skeleton displayed while auth state initializes.
- **Key Routes:**
  - `/today`: Morning/evening loop, habit quick actions, inspirational quote, Return Score, timeline of completions.
  - `/habits`: Tabbed view for active habits, archived habits, and suggestions; includes creation modal, drag-and-drop ordering.
  - `/reflections`: Journal timeline plus form wizard; mood sliders and virtue focus selection per entry.
  - `/marcus`: Persistent conversation list with streaming chat window and persona switcher (surface multiple Pocket Philosopher coaches).
  - `/settings`: Profile, notifications, privacy, integrations, data export.
  - `/profile`: Analytics dashboards (virtue balance, streak trend, Return Score history, habit heatmaps).
  - `/help`: FAQ accordion, feedback form, troubleshooting tips.

## 4. Component Patterns
- **Cards & Sections:** Layout uses responsive cards with gradient headers per virtue. Each major section has a header, context text, and CTA (e.g., “Log habit” button).
- **Action Panels:** Floating coach launcher and quick-add habit button persist across dashboard pages through a shared component rendered in the layout.
- **Forms:** Modal-driven for habit creation/editing; drawer-style for reflections to maintain context. Validation errors surface inline with subtle color cues.
- **Charts:** Use headless components plus Tailwind to render progress rings, bar charts, and heatmaps. Data retrieved via hooks hitting `/api/progress`.
- **Streaming UI:** Coach chat uses a streaming store to append tokens as they arrive; typing indicator and citation list update in real time.
- **Offline Modes:** When offline, display toast banner and mark sections with cached data. Interactions queue updates to sync when connectivity returns (handled by helper utilities).

## 5. State & Data Flow
- **Auth Store (`auth-store.ts`):** Maintains Supabase session, user profile, loading states, and helper selectors (display name). Hooks `useAuthGuard`, `useAuth` centralize gating logic.
- **Daily Progress Store (`daily-progress-store.ts`):** Tracks morning intention, completed habits, virtue scores, Return Score, loading flags, and error states. Exposes actions for initialization, toggling habit completion, and setting intentions (calls API then updates local store).
- **Habit Store (`habits-store.ts`):** Caches habit list, supports optimistic updates for create/update/archive, and exposes filter selectors by virtue or active status.
- **UI Store (`ui-store.ts`):** Handles theme, sidebar collapse, modals, notifications, and ephemeral UI state.
- **Streaming Store (`streaming-store.ts`):** Buffers AI responses token-by-token, tracks streaming status, and emits events for citations or warnings.

## 6. Data Access & Hooks
- Supabase client wrappers under `lib/hooks` provide React hooks like `useHabits`, `useReflections`, `useDailyProgress` (some still stubs) that encapsulate API requests and transform responses for UI consumption.
- When possible, hooks call Next.js API routes rather than direct Supabase queries to centralize security. Exceptions: read-only data (quotes, static constants) and local-only caches.
- Error handling: standard pattern returns `{ data, error, loading }`, surfaces toast via shared notification system, and logs to monitoring helper.

## 7. Theming & Philosophy Mode
- `usePhilosophyTheme` toggles color palettes, typography accents, and iconography to match selected philosophical tradition (Stoic default at first launch, but Taoist, Existentialist, etc. available). Theme affects backgrounds, gradient accents, and persona prompts.
- `lib/constants/philosophies` and `lib/ai/personas` define available philosophies, associated virtues, voice tone, and prompt scaffolding. UI provides quick switcher to alter persona and UI gradients.

## 8. Progressive Web App Behavior
- Service worker registered when PWA mode enabled; caches Next.js static assets and API responses for Today dashboard, habits, and reflections.
- Install prompts follow standard PWA guidelines with custom modal encouraging add-to-home-screen.
- Offline fallback screens provide quick journaling form and cached quotes; queued actions sync through API once connection resumes.

## 9. Testing Expectations
- **Unit/Component Tests:** React Testing Library snapshots for components, focusing on habit list interactions, reflection form validation, coach chat streaming states.
- **Integration Tests:** Jest suites verifying Zustand actions and hook data flows with mocked Supabase responses.
- **E2E (Playwright):** Cover login, onboarding, habit creation, daily logging, coach conversation, and offline banner behavior.

## 10. Rebuild Checklist
1. Scaffold App Router layout (public + authenticated) with navigation shell and providers.
2. Implement Zustand stores mirroring existing selectors/actions, wiring to API hooks.
3. Recreate core pages (`/today`, `/habits`, `/reflections`, `/marcus`, `/profile`, `/settings`) using card-based layout and shadcn/ui components.
4. Integrate Supabase-based hooks or API calls for data fetching/mutation, respecting optimistic UI expectations.
5. Implement coach chat streaming UI with persona switcher and citation list.
6. Enable PWA capabilities, offline caching, and install prompt experience.
7. Add accessibility refinements, toasts, and analytics instrumentation hooks.
