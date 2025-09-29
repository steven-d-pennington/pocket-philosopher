# Local Environment Onboarding

This guide walks new contributors through running Pocket Philosopher with Docker Compose while keeping parity with the standard Node-based workflow. The updated stack bundles Supabase, Redis, and an optional Ollama runtime so you can exercise the same topology used in staging.

## Prerequisites

- Node.js 20 and npm 10 (still required for scripts and tooling)
- Docker Desktop (or another container runtime)
- A populated `.env.local` (copy from `.env.example` and fill in secrets)

## Quick Start

1. **Install dependencies locally** so the first container build has cached modules:
   ```bash
   npm install
   ```
2. **Ensure `.env.local` exists** at the project root. Docker Compose reads it via the `env_file` directive.
3. **Start the application container** — this boots Next.js plus Supabase (Postgres, PostgREST, GoTrue, Storage, Realtime, Studio) and Redis:
   ```bash
   docker compose --profile app up --build
   ```
   - Visit <http://localhost:3000>.
   - Source files are bind-mounted, so edits on the host trigger hot reload inside the container.
4. **(Optional) Start the Ollama profile** if you need a local LLM endpoint:
   ```bash
   docker compose --profile ollama up -d
   ```
   Update `OLLAMA_URL` to `http://127.0.0.1:11434` (default) when using this profile.
5. **Preview offline/PWA features** by enabling the service worker in development:
   ```bash
   PWA_DEV=true npm run dev
   ```
   - Background sync and install prompts mirror staging behaviour.
   - The Playwright spec `e2e/specs/pwa-offline.spec.ts` exercises the install flow and cached assets.
6. **Stop containers** with `docker compose down`. Add `-v` if you want to clear the Ollama or Supabase volumes.

## Supabase & Database Notes

- The compose file exposes Supabase Postgres on **5432**, PostgREST on **8000**, GoTrue on **9999**, Realtime on **4000**, Storage on **5000**, and Studio on **54323**. These mirror staging defaults so URLs can match across environments.
- Default credentials are development-safe: `postgres` / `supabase` with a generated JWT secret. Override via `.env.local` if you need different values.
- Apply schema changes with Supabase migrations inside the `web` container or via `psql`:
  ```bash
  docker compose exec web supabase migration up
  ```
- Seed data by piping scripts to the bundled Postgres instance:
  ```bash
  psql "postgres://postgres:supabase@127.0.0.1:5432/postgres" -f supabase/seed.sql
  ```
- Redis listens on **6379** for caching experiments and offline sync simulations.

## Environment Parity Checklist

- Ensure the following variables are present in `.env.local` for both host and container workflows:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `TOGETHER_API_KEY` (optional but required for AI flows)
  - `POSTHOG_API_KEY`
- When using the compose defaults, set `NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000` and reuse `supabase-anon-key` for local testing. The service role key is logged by the `supabase-auth` container on boot.
- Secrets remain in `.env.local`; the compose file only supplies safe defaults.
- Container defaults set `HOST=0.0.0.0` so Next.js listens on all interfaces.

## Verification

1. `npm run lint` (inside container or host) should succeed.
2. <http://localhost:3000/api/health> returns `status: "ok"` with Supabase, Redis, and AI provider diagnostics.
3. API logs: inspect `docker compose logs web` to confirm structured request logs (look for `requestId`).
4. Optional: visit <http://localhost:54323> to access Supabase Studio with the default credentials.
For staging/production deployment runbooks, see the dedicated guides in this folder.

For staging/production deployment runbooks, see upcoming tasks in docs/build-plan/tasks/deployment-and-operations/tasks.md.
