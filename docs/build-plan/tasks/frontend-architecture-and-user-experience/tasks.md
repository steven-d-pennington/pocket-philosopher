# Frontend Architecture & User Experience - Task Plan

## Phase 1: Shell & Routing Foundation
1. [Complete] Implement the App Router public and authenticated layouts, including providers (QueryClientProvider, ThemeProvider, Toast) and offline-aware wrappers.
2. [Complete] Build global navigation (top bar, sidebar) with accessibility instrumentation and route guards tied to the auth store.
3. [Not Started] Configure analytics hooks and page-level metadata scaffolding to align with observability and SEO requirements. [P]

## Phase 2: State Management & Data Access
1. [Complete] Reconstruct Zustand stores for auth, daily progress, habits, UI, and streaming with TypeScript typings and Immer helpers.
2. [Complete] Wire TanStack Query hooks for Supabase-backed data fetching, including caching, refetch intervals, and optimistic update patterns.
3. [Not Started] Implement local storage hydration and offline draft persistence utilities shared across stores. [P]

## Phase 3: Core Experience Flows
1. [Started] Build the (dashboard)/today experience: morning intention form, habit quick actions, Return Score tiles, and inspirational quote modules.
2. [Started] Deliver (dashboard)/habits with CRUD modals, scheduling controls, reminder settings, and drag-and-drop ordering.
3. [Started] Implement (dashboard)/reflections guided journaling, mood sliders, persona cues, and timeline views.
4. [Started] Assemble (dashboard)/coaches (/marcus) streaming chat with persona switcher, citation list, and typing indicators.
5. [Started] Complete supporting routes (onboarding, profile, settings, help) with consistent layout components and responsive design. [P]

## Phase 4: UI Components, Styling, and PWA Enhancements
1. [Started] Curate shadcn/ui component library extensions, Tailwind theme tokens, and design documentation.
2. [Not Started] Add Framer Motion animations and focus-visible states to critical interactions while preserving performance budgets. [P]
3. [Not Started] Configure Workbox service worker, install prompts, and offline synchronization flows; validate behavior on desktop and mobile.
