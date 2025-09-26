# Frontend Architecture & User Experience

## 1. App Shell & Routing
- Scaffold the App Router layout with public and authenticated segments.
- Implement navigation shell, theme provider, analytics hooks, and offline-aware wrappers.
- Add a centralized metadata helper and analytics provider (PostHog) to keep instrumentation consistent.
- Ensure routing aligns with documented flow and accessibility requirements.

## 2. State Management
- Rebuild Zustand stores for auth, daily progress, practices, streaming, and UI preferences.
- Integrate TanStack Query for server state management and caching.
- Implement local storage hydration strategies for offline drafts and resiliency using shared persist helpers and reusable draft hooks.

## 3. Core Pages & Flows
- `(dashboard)/today`: morning intention, practice logging, analytics tiles, daily quote.
- `(dashboard)/practices`: CRUD UI, scheduling controls, reminder settings. Create/edit modals support virtue selection, cadence tweaks, reminders, and archive toggles with Supabase-backed mutations; drag ordering remains.
- `(dashboard)/reflections`: guided journaling with mood sliders and persona cues.
- `(dashboard)/coaches` (`/marcus`): chat interface, persona switcher, citation display, streaming status UI. Workspace layout, persona filtering, and mock streaming loop now implemented; citation surfaces and AI orchestration integration upcoming.
- Profile, settings, onboarding, help/support pages aligned with experience specs.

## 4. UI Components & Styling
- Assemble shadcn/ui component library and design system tokens.
- Implement responsive layouts, accessibility semantics, and aria attributes.
- Add Framer Motion interactions and micro-animations per experience guidelines.

## 5. Offline & PWA Features
- Configure Workbox service worker with defined caching strategies.
- Implement install prompts and offline storage synchronization flows.
- Validate behavior across desktop and mobile scenarios.

