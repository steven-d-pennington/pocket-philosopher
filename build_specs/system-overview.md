# Pocket Philosopher – System Rebuild Blueprint

This document summarizes the product vision, user experience goals, and high-level architecture of Pocket Philosopher. It is designed as the entry point for an AI agent that needs to reproduce the experience and underlying systems without relying on the existing source code.

## 1. Product Mission and User Promise
- **Audience:** Curious, growth-oriented people who want philosophical wisdom—Stoic, Eastern, Existentialist, and beyond—to support their daily lives.
- **Value Proposition:** Provide a supportive daily loop that combines habit tracking, reflective journaling, and AI philosophy mentors that supply context-aware guidance from multiple traditions.
- **Experience Pillars:**
  1. **Daily Practice Hub:** Morning intentions, habit logging, and evening reflections in a single flow.
  2. **Pocket Philosopher Coaches:** Conversational assistants (Marcus the Stoic, Lao the Taoist, Simone the Existentialist, etc.) powered by retrieval-augmented generation over curated texts plus personal context.
  3. **Virtue-Based Progress:** Habits and reflections map to shared human virtues (wisdom, justice, temperance, courage) and persona-specific ideals.
  4. **Shame-Free Analytics:** Custom “Return Score” and philosophy lens breakdowns reward consistency and self-compassion across traditions.

## 2. Platform Overview
- **Client Application:** Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui component library, Lucide icons, and Framer Motion animations.
- **State Management:**
  - Lightweight client stores built with Zustand (`lib/stores`) for auth, daily progress, habits, streaming state, and UI preferences.
  - TanStack Query for server state (Supabase and coach API requests) where async caching or background refresh is needed.
  - Local storage hydration for offline-friendly data (habits, morning intention, reflection drafts).
- **Backend:**
  - Next.js API routes under `app/api` encapsulate all server functionality.
  - Supabase (PostgreSQL) hosts the persistent data model, authentication, row-level security, and edge functions.
  - AI services accessed through an abstraction layer that can switch between OpenAI, Anthropic, or self-hosted providers.
- **Infrastructure & Delivery:**
  - Optimized for Vercel hosting; production deployments also work on Fly.io or Docker Compose environments.
  - Progressive Web App wrapper via Workbox service worker, offline caching, and installable manifest.
  - CI expectations include linting, type checking, Jest unit/integration suites, and Playwright end-to-end tests.

## 3. Functional Modules
| Module | Purpose | Key Interfaces |
| --- | --- | --- |
| **Authentication & Profiles** | Email/password auth routed through Supabase. Profiles extend Supabase users with philosophy preferences (default tradition, persona roster, notification schedule). | Public auth pages `(auth)` segment; Zustand `auth-store`; API `app/api/auth` and `app/api/profile`. |
| **Onboarding** | Collects preferred virtues, philosophical inspirations, availability, and device reminders to seed profile and initial habit recommendations. | `(dashboard)/onboarding`; uses Supabase profile mutations and habit templates. |
| **Daily Practice Hub** | Central dashboard for current day. Users set morning intention, log curated or custom habits, review inspirational quote, and close day with reflections. | `(dashboard)/today` page, `daily-progress-store`, `useHabits` hook, `app/api/daily-progress`, `app/api/habits`. |
| **Habits Management** | CRUD for virtue- or principle-tagged habits, scheduling, reminders, and logging completions (including metadata like mood before/after). | `(dashboard)/habits`, `app/api/habits`, Supabase tables `habits` and `habit_logs`. |
| **Reflections** | Guided journaling (morning, evening, midday). Questions adapt to virtue focus and active persona, and results feed analytics. | `(dashboard)/reflections`, `app/api/reflections`, Supabase `reflections`. |
| **Analytics & Return Score** | Aggregates habit completion, virtue scores, streaks, persona insights, and “Return Score” to emphasize resilience. | `(dashboard)/today` tiles, `(dashboard)/profile` analytics, `app/api/progress`, Supabase `daily_progress` & `progress_summaries` with trigger-driven calculations. |
| **Pocket Philosopher Coaches** | Persistent chat threads with personalized philosophical advice using RAG over multi-tradition texts plus user context (recent habits, reflections). | `(dashboard)/coaches` (alias `/marcus` in codebase), `app/api/marcus`, AI layer in `lib/ai`, Supabase `marcus_conversations` & `marcus_messages`. |
| **Settings & Preferences** | Update profile, persona selections, notification preferences, privacy settings, data export. | `(dashboard)/settings`, Supabase `profiles`, optional integration with `app_settings`. |
| **Support & Feedback** | Help center content plus form that stores feedback with optional metadata. | `(dashboard)/help`, `app/api/debug`/`app/api/health` for diagnostics, Supabase `feedback`. |

## 4. User Journeys
1. **New User:** Sign up → guided onboarding (virtue focus, top goals) → sample habits seeded → redirected to Today hub with welcome concept and recommended actions.
2. **Morning Loop:** User opens PWA → receives cached quote + daily concept → sets or updates morning intention → logs initial habits.
3. **Pocket Philosopher Interaction:** From any screen, user opens the coach panel → selects a persona (e.g., Marcus, Lao, Simone) or starts new → agent fetches personalized context (habits, reflections, virtue) → response streamed using AI provider and citing primary texts.
4. **Evening Reflection:** Prompted to complete evening reflection → questions adapt to day’s events → submission triggers recalculation of daily progress and Return Score.
5. **Analytics Review:** Weekly summary aggregates Return Score trends, virtue balance, habit adherence, and sends optional notifications or prompts for adjustments.

## 5. Data & Integration Highlights
- **Core Tables:** `profiles`, `habits`, `habit_logs`, `reflections`, `daily_progress`, `progress_summaries`, `marcus_conversations`, `marcus_messages`, `app_settings`, `feedback`, plus persona metadata tables if expanded (see `data-models.md`).
- **Automation:** Database trigger `recalculate_progress_on_habit_log_change` calls `calculate_daily_progress` to keep Return Score, virtue metrics, and persona lens insights in sync when logs change.
- **Security:**
  - Row Level Security ensures users only access their own records.
  - API middleware adds rate limiting, auth validation, and sanitization before touching Supabase.
  - CSP and security headers enforced through `next.config.js`.
- **Environment Inputs:** Supabase project credentials, OpenAI API key, optional Anthropic/Together/Ollama keys, feature flags, PostHog analytics key, and notification configuration.

## 6. Non-Functional Expectations
- **Performance:** Sub-2 second perceived latency for dashboard interactions; streaming responses for AI conversations to show progress quickly.
- **Offline Resilience:** Service worker caches static shell, stores latest habits/reflections locally, queues updates until online.
- **Accessibility:** Keyboard navigation, semantic headings, aria labels on interactive shadcn/ui components, accessible color palette aligned with Pocket Philosopher brand themes.
- **Privacy:** Optional privacy modes (private/friends/public) in profiles; habit/ reflection data remains private by default; AI logs redact or hash sensitive prompts.
- **Observability:** AI layer emits structured events (latency, tokens, provider used); application logging uses centralized helpers for server routes.

## 7. Companion Specifications
- [Frontend Experience Blueprint](./frontend.md) — UI architecture, state, routing, PWA behavior.
- [Backend & Data Contracts](./backend-and-data.md) — API responsibilities, Supabase schema, environment variables.
- [AI & Knowledge System](./ai-system.md) — Pocket Philosopher coach orchestration, RAG corpus, provider abstraction, observability.

Rebuilding the platform should begin with establishing Supabase schema and authentication, followed by replicating the Next.js frontend shells and API routes as described in the companion documents.
