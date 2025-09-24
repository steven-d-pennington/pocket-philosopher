# Backend & Data Contracts

This document describes the server-side responsibilities, data contracts, and environment expectations. It is aimed at rebuilding the Supabase-backed API layer that powers Pocket Philosopher.

## 1. Architectural Overview
- **Runtime:** Next.js API routes (Edge-friendly where possible) using TypeScript.
- **Database:** Supabase PostgreSQL with Row Level Security (RLS) enabled for all user-owned tables.
- **ORM/Client:** Supabase JS client instantiated per request (`createServerClient`).
- **Authentication:** Supabase Auth JWT; API routes require authenticated user and enforce rate limits via middleware.
- **Validation:** Zod schemas under `lib/validation/schemas` sanitize and validate incoming payloads.
- **Security Helpers:** Middleware `withAuthAndRateLimit` handles auth, RLS session, and leaky bucket throttling; `sanitizeText` strips unsafe HTML; `lib/security` hosts additional guards (CSP, headers, XSS protection).

## 2. API Route Responsibilities
Each route lives under `app/api/<feature>/route.ts` and exports HTTP verb handlers wrapped in middleware.

| Route | Methods | Purpose | Key Behaviors |
| --- | --- | --- | --- |
| `/api/auth` | `POST` (login/signup), `DELETE` (logout) | Proxy Supabase auth endpoints with custom error messaging and event logging. | Returns standardized `{ success, data, error }` payloads, sets Supabase cookies. |
| `/api/profile` | `GET`, `PUT` | Fetch/update user profile (virtue preferences, default persona roster, notification settings, privacy, timezone). | Validates payload with `ProfileUpdateSchema`, writes to `profiles` table, updates Supabase auth metadata. |
| `/api/habits` | `GET`, `POST`, `PUT`, `DELETE` | Manage habits and completions. Supports action-based POST body (`create`, `log`). | Filters by virtue/active/archive, optionally includes `habit_logs`. Logging triggers recalculation of daily progress. |
| `/api/daily-progress` | `GET`, `POST` | Read daily metrics and set morning intentions. | `POST` accepts actions `set_intention`, `complete_habit`, `sync_local`. Reads/writes `daily_progress`. |
| `/api/progress` | `GET` | Provide aggregated analytics (weekly/monthly Return Score, virtue breakdown). | Queries `progress_summaries`, merges with `daily_progress` for charts. |
| `/api/reflections` | `GET`, `POST`, `PUT`, `DELETE` | CRUD reflections (morning/evening/midday). | Handles journaling fields, mood sliders, virtue focus, ensures `UNIQUE(user_id, date, type)`. |
| `/api/marcus` | `GET`, `POST`, `PUT`, `DELETE` | Manage Pocket Philosopher coach conversations and streaming replies (route name retained for legacy reasons). | Connects to AI service for chat, persists messages in `marcus_messages`, streams tokens, caches citations. |
| `/api/ai/*` | `POST`, `GET` | AI ingestion/search/migration endpoints (search corpus, ingest philosophy texts across traditions). | Most routes require admin header and interface with `lib/ai` modules. |
| `/api/health` | `GET` | Health diagnostics (Supabase connectivity, AI availability, service worker status). | Returns object with dependency checks for uptime monitoring. |
| `/api/debug` | `GET`, `POST` | Developer utilities (rate limit status, feature flags). | Protected by admin role, surfaces environment/config snapshots. |

### Middleware Flow
1. `withAuthAndRateLimit(namespace, handler)` obtains Supabase client, checks JWT, and enforces namespace-specific quotas.
2. Handler receives `{ user, supabase, rateLimit }` context and `NextRequest` object.
3. Input validated via Zod schema; sanitized text fields to avoid script injection.
4. Database operations executed with Supabase client; responses wrapped as `{ success, data, error, message }` for consistency.

## 3. Data Model Summary
Supabase schema defined in `database/schema.sql` with the following core tables:

| Table | Purpose | Notable Columns |
| --- | --- | --- |
| `profiles` | Extends `auth.users` with philosophy preferences and onboarding info. | `preferred_virtue`, `preferred_persona`, `experience_level`, `daily_practice_time`, `timezone`, `notifications_enabled`, `privacy_level`, timestamps, `last_active_at`. |
| `habits` | User-defined habits tied to virtues. | `virtue`, `tracking_type`, `target_value`, `difficulty_level`, `frequency`, `active_days[]`, `reminder_time`, `is_active`, `is_archived`, `sort_order`. |
| `habit_logs` | Daily completion records. | `date`, `value`, `target_value`, `notes`, `mood_before/after`, `difficulty_felt`, `UNIQUE(user_id, habit_id, date)`. |
| `reflections` | Morning/evening journaling entries. | `type`, `virtue_focus`, intention/lesson fields, mood metrics, `journal_entry`, array fields for `key_insights`, `challenges_faced`, `wins_celebrated`. |
| `daily_progress` | Stores per-day metrics calculated from habits/reflections. | Virtue scores, `overall_score`, `habits_completed`, `completion_rate`, `return_score`, `streak_days`, boolean flags for reflection completion. |
| `progress_summaries` | Weekly/monthly aggregated analytics. | `period_type`, start/end dates, averaged scores, completion totals, `avg_return_score`, `most_consistent_virtue`. |
| `marcus_conversations` | Conversation metadata for AI coaches (persona id, tradition tags). | `title`, `context_type`, `virtue_focus`, `active_persona`, `is_active`, timestamps. |
| `marcus_messages` | Individual chat messages. | `role` (`user`/`assistant`/`system`), `content`, `persona_id`, `user_context` JSONB, `ai_reasoning`, `message_order`. |
| `app_settings` | Feature flags and configuration values. | `key`, `value` JSONB, `is_public`, `description`. |
| `feedback` | User feedback submissions. | `type`, `priority`, `page_url`, `device_info`, `status`, `admin_notes`. |

### Automations & Constraints
- `calculate_daily_progress(user_uuid, target_date)` function aggregates habit logs, calculates virtue scores, Return Score, philosophy lens breakdowns, and streak. Triggered by `recalculate_progress_on_habit_log_change` after any insert/update/delete on `habit_logs`.
- All tables have `updated_at` triggers to maintain modification timestamps.
- Indexes on common query paths (e.g., `idx_habits_user_active`, `idx_reflections_user_date`, `idx_daily_progress_return_score`).
- RLS policies restrict access to authenticated user records; feedback allows anonymous submissions when `user_id` null.

## 4. Environment Variables
The environment is validated via `lib/env-validation.js` against a JSON schema. Key variables to provision:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (public). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key for client-side usage. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional server-side key for administrative operations. |
| `OPENAI_API_KEY` | Primary AI provider key. |
| `ANTHROPIC_API_KEY`, `TOGETHER_API_KEY`, `OLLAMA_URL` | Optional alternative providers for multi-model support. |
| `POSTHOG_API_KEY` | Analytics instrumentation. |
| `NEXT_PUBLIC_POSTHOG_HOST` | Custom PostHog host if applicable. |
| `EMAIL_FROM`, `RESEND_API_KEY` | Email delivery (if transactional emails enabled). |
| `PWA_DEV` | Flag to enable service worker in development. |
| `CUSTOM_KEY` | Sample custom env referenced in `next.config.js`; safe default acceptable. |

## 5. Rate Limiting & Monitoring
- **Rate Limits:** Namespaced quotas defined in middleware (e.g., `habits`, `marcus`). Typically allow short bursts with sliding window resets; exceeding limit returns HTTP 429 with `Retry-After` header.
- **Observability:** AI routes push metrics into `lib/ai/monitoring` (latency, tokens). API logs standard JSON objects (`level`, `event`, `userId`) for ingestion by hosted logging solutions.
- **Health Checks:** `/api/health` executes Supabase ping, AI provider availability, and environment validation; consumed by uptime monitors.

## 6. Deployment & Operations
- **Database Migration:** Apply `database/schema.sql` (plus additional files such as `database/profile-sync.sql`, `database/seed.sql` for sample data). For RAG features, include migrations under `database/migrations`.
- **Supabase Edge Functions:** Not present in repo but reserved for future expansions; ensure API routes are performant enough for user load.
- **Dockerization:** `docker-compose.yml` orchestrates web (Next.js) and supporting services; `.env.local` loaded into container.
- **Secrets Management:** Production deployments rely on platform secret stores (Vercel env vars, Fly.io secrets). Avoid embedding keys in code.
- **Backups:** Schedule Supabase backups or use `scripts` folder utilities to export schema/data for disaster recovery.

## 7. Rebuild Steps
1. Provision Supabase project, run schema SQL, enable RLS, and configure auth providers.
2. Implement Next.js API routes mirroring the responsibilities above, integrating middleware, validation, and consistent responses.
3. Connect API routes to Supabase client using service role on server, anon key on client.
4. Recreate scheduled triggers (daily progress recalculation) and indexes to ensure analytics behave correctly.
5. Configure environment variables, rate limiting, and monitoring hooks.
6. Seed initial data (habit templates, multi-tradition quotes) using scripts under `database/seed_data` as references.
