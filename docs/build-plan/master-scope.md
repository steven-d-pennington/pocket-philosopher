# Pocket Philosopher Master Scope

## Product Mission
- Deliver a daily philosophical companion that blends habit tracking, reflective journaling, and multi-tradition AI mentors.
- Serve growth-oriented users seeking Stoic, Taoist, Existentialist, and related wisdom that adapts to their personal goals.

## Feature Scope
- **Authentication & Profiles**: Supabase email/password auth, profile extensions for virtue focus, persona roster, notification cadence, privacy modes.
- **Onboarding Flow**: Collect preferred virtues, inspirations, availability, reminder schedule; seed template habits and reflection prompts.
- **Daily Practice Hub**: Unified today view for morning intentions, habit quick actions, inspirational quote, Return Score snapshot, and evening closeout.
- **Habits Management**: CRUD for virtue-tagged habits, scheduling, reminders, mood tracking, drag-and-drop ordering, archive/restore.
- **Reflections & Journaling**: Guided morning/evening/midday forms with adaptive questions, mood sliders, virtue focus, timeline view.
- **Pocket Philosopher Coaches**: Persona-driven chat UI with streaming responses, citation list, persona switcher, conversation persistence.
- **Analytics & Return Score**: Weekly/monthly dashboards, virtue balance, streak tracking, habit heatmaps, personalized insights.
- **Settings & Preferences**: Profile editing, philosophy theme toggle, notifications, privacy, data export, integrations roadmap.
- **Support & Feedback**: Help center content, feedback submission with optional metadata, diagnostics endpoints.
- **PWA Experience**: Installable shell, offline caching of dashboard data, queued updates, custom add-to-home prompt.

## Backend & Data Scope
- Next.js API routes per feature (/api/auth, /api/habits, /api/daily-progress, /api/reflections, /api/marcus, /api/progress, /api/ai/*, /api/health, /api/debug).
- Supabase PostgreSQL schema covering profiles, habits, habit_logs, reflections, daily_progress, progress_summaries, marcus_conversations/messages, app_settings, feedback, plus pgvector-backed corpus tables.
- Row Level Security for user-owned tables, trigger-driven recalculation of daily progress, indexes on high-traffic queries.
- Shared middleware for auth, rate limiting, sanitization, standardized response envelope, and structured logging.

## AI & Knowledge Scope
- Provider abstraction supporting OpenAI, Anthropic, Together, and optional Ollama with failover priorities.
- Retrieval-augmented generation pipeline: hybrid search over philosophy corpus, persona-aware prompt assembly, streaming completions, citation validation.
- Persona definitions capturing tone, virtues, prompts; caching layer to avoid duplicate token spend; ingestion endpoints for corpus maintenance.
- Telemetry and evaluation harness monitoring latency, token usage, retrieval quality, and persona adherence.

## Constraints & Standards
- Tech stack locked to Next.js 14 (App Router) + TypeScript, Tailwind, shadcn/ui, Zustand, TanStack Query, Framer Motion, Lucide icons.
- Strict TypeScript, ESLint + Prettier baselines, Jest + Playwright testing suites.
- Accessibility: keyboard-first navigation, ARIA labeling, accessible color palettes.
- Performance: <2s perceived latency on dashboard interactions, streaming coach responses, offline resilience via service worker.
- Security: environment validation, CSP/security headers, sanitized inputs, Supabase RLS, rate limiting on sensitive routes.
- Observability: centralized logging, AI metrics, health checks, feature flag visibility.

## Success Criteria
- Users complete a full daily loop (onboarding -> Today -> coach interaction -> evening reflection) without blockers on desktop or mobile web.
- Return Score, virtue analytics, and habit data stay consistent between client, API, and database after triggers run.
- AI coach responses include at least one validated citation and actionable micro-steps in 95% of successful sessions.
- PWA install prompt works on supported browsers; offline mode allows habit/reflection drafting with later sync.
- CI pipeline enforces lint/type/test checks and bundler build passes against validated environment variables.

## Dependencies & Sequencing
1. Provision Supabase schema, environment variables, and auth configuration to unblock API and frontend integration.
2. Scaffold Next.js project with shared layout, providers, and state stores to host feature routes.
3. Implement core API routes and data models powering habits, reflections, analytics, and coach conversations.
4. Integrate AI service layer and retrieval pipeline once data models and conversation storage are available.
5. Layer on analytics dashboards, PWA enhancements, and observability tooling after primary flows stabilize.
6. Conduct end-to-end testing (Jest + Playwright) before enabling deployments and AI ingestion tooling.



