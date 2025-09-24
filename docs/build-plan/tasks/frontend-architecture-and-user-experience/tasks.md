# Frontend Architecture & User Experience — Task Plan

## Phase 1: Shell & Routing Foundation
1. Implement the App Router public and authenticated layouts, including providers (QueryClientProvider, ThemeProvider, Toast) and offline-aware wrappers.
2. Build global navigation (top bar, sidebar) with accessibility instrumentation and route guards tied to the auth store.
3. Configure analytics hooks and page-level metadata scaffolding to align with observability and SEO requirements. [P]

## Phase 2: State Management & Data Access
1. Reconstruct Zustand stores for auth, daily progress, habits, UI, and streaming with TypeScript typings and Immer helpers.
2. Wire TanStack Query hooks for Supabase-backed data fetching, including caching, refetch intervals, and optimistic update patterns.
3. Implement local storage hydration and offline draft persistence utilities shared across stores. [P]

## Phase 3: Core Experience Flows
1. Build the `(dashboard)/today` experience: morning intention form, habit quick actions, Return Score tiles, and inspirational quote modules.
2. Deliver `(dashboard)/habits` with CRUD modals, scheduling controls, reminder settings, and drag-and-drop ordering.
3. Implement `(dashboard)/reflections` guided journaling, mood sliders, persona cues, and timeline views.
4. Assemble `(dashboard)/coaches` (`/marcus`) streaming chat with persona switcher, citation list, and typing indicators.
5. Complete supporting routes (onboarding, profile, settings, help) with consistent layout components and responsive design. [P]

## Phase 4: UI Components, Styling, and PWA Enhancements
1. Curate shadcn/ui component library extensions, Tailwind theme tokens, and design documentation.
2. Add Framer Motion animations and focus-visible states to critical interactions while preserving performance budgets. [P]
3. Configure Workbox service worker, install prompts, and offline synchronization flows; validate behavior on desktop and mobile.
