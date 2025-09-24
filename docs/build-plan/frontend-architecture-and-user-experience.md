# Frontend Architecture & User Experience

## 1. App Shell & Routing
- Scaffold the App Router layout with public and authenticated segments.
- Implement navigation shell, theme provider, analytics hooks, and offline-aware wrappers.
- Ensure routing aligns with documented flow and accessibility requirements.

## 2. State Management
- Rebuild Zustand stores for auth, daily progress, habits, streaming, and UI preferences.
- Integrate TanStack Query for server state management and caching.
- Implement local storage hydration strategies for offline drafts and resiliency.

## 3. Core Pages & Flows
- `(dashboard)/today`: morning intention, habit logging, analytics tiles, daily quote.
- `(dashboard)/habits`: CRUD UI, scheduling controls, reminder settings.
- `(dashboard)/reflections`: guided journaling with mood sliders and persona cues.
- `(dashboard)/coaches` (`/marcus`): chat interface, persona switcher, citation display, streaming status UI.
- Profile, settings, onboarding, help/support pages aligned with experience specs.

## 4. UI Components & Styling
- Assemble shadcn/ui component library and design system tokens.
- Implement responsive layouts, accessibility semantics, and aria attributes.
- Add Framer Motion interactions and micro-animations per experience guidelines.

## 5. Offline & PWA Features
- Configure Workbox service worker with defined caching strategies.
- Implement install prompts and offline storage synchronization flows.
- Validate behavior across desktop and mobile scenarios.
