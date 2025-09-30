# Frontend Architecture & User Experience - Task Plan

## Phase 1: Shell & Routing Foundation
1. [Complete] Implement the App Router public and authenticated layouts, including providers (QueryClientProvider, ThemeProvider, Toast) and offline-aware wrappers.
2. [Complete] Build global navigation (top bar, sidebar) with accessibility instrumentation and route guards tied to the auth store.
3. [Complete] Configure analytics hooks and page-level metadata scaffolding to align with observability and SEO requirements. [P]

## Phase 2: State Management & Data Access
1. [Complete] Reconstruct Zustand stores for auth, daily progress, practices, UI, and streaming with TypeScript typings and Immer helpers.
2. [Complete] Wire TanStack Query hooks for Supabase-backed data fetching, including caching, refetch intervals, and optimistic update patterns.
3. [Complete] Implement local storage hydration and offline draft persistence utilities shared across stores. [P]

## Phase 3: Core Experience Flows
1. [Complete] Build the (dashboard)/today experience: morning intention form, practice quick actions, Return Score tiles, and inspirational quote modules.
2. [Complete] Deliver (dashboard)/practices with CRUD modals, scheduling controls, reminder settings, and drag-and-drop ordering (create & edit modals live with archive/restore toggles).
3. [Complete] Implement (dashboard)/reflections guided journaling, mood sliders, persona cues, and timeline views.
4. [Complete] Assemble (dashboard)/coaches (/marcus) streaming chat with persona switcher, citation list, and typing indicators (workspace UI, live `/api/marcus` streaming orchestration powered by OpenAI + Supabase RAG context, persistence, and inline citation surfacing in place).
5. [Complete] Complete supporting routes (onboarding, profile, settings, help) with consistent layout components and responsive design. [P]

## Phase 5: User Experience Polish 🚀 IN PROGRESS
1. ✅ **Citation Display Enhancement**: Redesigned citation component with better typography, numbered references, and improved visual hierarchy.
2. 🔄 **Conversation UI Improvements**: Enhance chat interface with better message threading, loading states, and visual hierarchy.
3. ✅ **Streaming Response Indicators**: Added sophisticated loading states with animated indicators and better visual feedback during AI responses.
4. 🔄 **Mobile Experience Optimization**: Ensure citations and chat work perfectly on mobile devices.
5. 🔄 **Accessibility Improvements**: Enhance screen reader support and keyboard navigation for citations and chat.


