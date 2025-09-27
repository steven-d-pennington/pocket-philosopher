# Pocket Philosopher

Pocket Philosopher is a daily practice hub that blends intention-setting, virtue practices, reflective journaling, and an AI “coach” into a simple loop you can return to every day. It’s built with Next.js and Supabase for a fast, local-first developer experience.

## Features

- Daily dashboard: intention, quick practice toggles, reflection status, and coach preview.
- Practices: create, edit, sort, and archive practices with frequency, virtue, and reminders.
- Reflections: morning/midday/evening journaling with a rolling timeline and completion status.
- AI coach (Marcus + personas): chat-style guidance with streaming responses and saved history.
- Supabase-backed data: tables for practices, reflections, profiles, and coach conversations.
- Developer tools: Supabase Studio, Mailpit (local email), Jest + Playwright test hooks.

## Stack

- Next.js 15 (App Router), React 19, Tailwind, shadcn/ui
- State/data: Zustand, React Query, SWR
- Supabase (Postgres, Auth, Storage, Edge functions)
- Optional analytics: PostHog (opt-in via env)

## Prerequisites

- Docker Desktop (engine running)
- Node.js 20+
- npm 10+
- Supabase CLI (bundled via `npx supabase`)

## Local Setup

1) Install dependencies
- `npm install`

2) Start Supabase (custom ports)
- This repo uses custom ports to avoid Windows WSL/relay conflicts:
  - API `55432`, DB `55433`, Studio `55434`, Mailpit `55435`, Shadow DB `55430`, Pooler `55439`
- Run: `npx supabase start`
- Useful URLs after start:
  - API: `http://127.0.0.1:55432`
  - DB: `postgresql://postgres:postgres@127.0.0.1:55433/postgres`
  - Studio: `http://127.0.0.1:55434`
  - Mailpit: `http://127.0.0.1:55435`

3) Configure environment
- Copy `.env.example` → `.env.local`
- Required Supabase values for local dev:
  - `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:55432`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH`
  - `SUPABASE_SERVICE_ROLE_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz`
- Optional providers: `OPENAI_API_KEY`, `POSTHOG` keys, etc.

4) Run the app
- `npm run dev`
- Open `http://localhost:3000`

Notes
- Seeds: `supabase/seed.sql` is optional and not required for first run.
- Analytics: disabled locally by default (Windows often needs Docker TCP at `tcp://localhost:2375`). Enable by setting `[analytics] enabled = true` in `supabase/config.toml` and exposing the Docker socket.

## Scripts

- `npm run dev` — start Next.js locally
- `npm run build` — production build
- `npm run start` — run the production server
- `npm run lint` — ESLint (flat config)
- `npm run typecheck` — TypeScript type checks
- `npm run format` / `npm run format:write` — Prettier check or write
- `npm test` / `npm run test:watch` — Jest unit/integration
- `npm run e2e` / `npm run e2e:headed` — Playwright E2E (expects local server)

## Repository Layout

- `app/` — App Router routes and layouts
- `components/` — UI primitives and feature components (dashboard, practices, reflections, coach)
- `lib/` — utilities, stores, hooks, env, fonts, Supabase client/types
- `styles/` — Tailwind config and extensions
- `database/` — schema/migrations (if present)
- `supabase/` — local Supabase CLI configuration (ports, services)
- `scripts/` — automation (seeding, diagnostics)
- `e2e/` and `tests/` — Playwright and Jest tests
- `docs/` — build plan and references

For detailed scope and sequencing, see `docs/build-plan/*`.

## Troubleshooting

- Supabase won’t start on Windows: default ports can be held by `wslrelay`. This repo pins custom ports in `supabase/config.toml`. If you change them, update `.env.local` accordingly.
- Docker TCP/Analytics: if enabling analytics locally, expose Docker at `tcp://localhost:2375` per Supabase docs.
- Keys after reset: if you prune volumes or reset Supabase, the local publishable/secret keys may change. Copy the fresh keys printed by `npx supabase start` into `.env.local`.
