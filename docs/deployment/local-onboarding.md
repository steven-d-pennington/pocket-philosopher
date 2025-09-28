# Local Environment Onboarding

This guide walks new contributors through running Pocket Philosopher with Docker Compose while keeping parity with the standard Node-based workflow.

## Prerequisites

- Node.js 20 and npm 10 (still required for scripts and tooling)
- Docker Desktop (or another container runtime)
- Supabase CLI (
pm install -g supabase) for running the local database stack
- A populated .env.local (copy from .env.example and fill in secrets)

## Quick Start

1. **Install dependencies locally** so the first container build has cached modules:
   `ash
   npm install
   `
2. **Ensure .env.local exists** at the project root. Docker Compose reads it via the env_file directive.
3. **Start the application container**:
   `ash
   docker compose --profile app up --build
   `
   - Visit <http://localhost:3000>.
   - Source files are bind-mounted, so edits on the host trigger hot reload inside the container.
4. **(Optional) Start the Ollama profile** if you need a local LLM endpoint:
   `ash
   docker compose --profile ollama up -d
   `
   Update OLLAMA_URL to http://127.0.0.1:11434 (default) when using this profile.
5. **Stop containers** with docker compose down. Add -v if you want to clear the Ollama volume.

## Supabase & Database Notes

- Supabase is not defined in the compose file. Use the official CLI when you need the full stack:
  `ash
  supabase start
  `
- Keep the CLI ports (54321/54322/54323/54324) aligned with the defaults in .env.local and the compose environment fallbacks.
- After supabase db push, load seeds:
  `ash
  psql "postgres://postgres:postgres@127.0.0.1:54322/postgres" -f supabase/seed.sql
  `

## Environment Parity Checklist

- Ensure the following variables are present in .env.local for both host and container workflows:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - OPENAI_API_KEY, ANTHROPIC_API_KEY, TOGETHER_API_KEY (optional but required for AI flows)
  - POSTHOG_API_KEY
- Secrets remain in .env.local; the compose file only supplies safe defaults.
- Container defaults set HOST=0.0.0.0 so Next.js listens on all interfaces.

## Verification

1. 
pm run lint (inside container or host) should succeed.
2. <http://localhost:3000/api/health> returns status: "ok" with Supabase diagnostics.
3. Optional: inspect docker compose logs web to confirm structured request logs (look for equestId).

For staging/production deployment runbooks, see upcoming tasks in docs/build-plan/tasks/deployment-and-operations/tasks.md.
