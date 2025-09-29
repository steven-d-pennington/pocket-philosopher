# Cloud Agent Task Brief - Q4 Workstreams

## Context Snapshot
- Telemetry groundwork is partially delivered: structured logging and PostHog helpers exist, the /api/health endpoint surfaces basic provider stats, and dashboards for AI metrics are documented.
- Provider registry supports multiple vendors with health caching, but embeddings and failover polish require follow-up.
- Frontend core flows are live; PWA, motion, and design-system enhancements remain.
- Playwright smoke tests and Docker onboarding are available, yet deployment guides and CI alignment are incomplete.

## Mission
Keep the automation agent focused on telemetry, AI orchestration, experience polish, and ops-readiness to unblock the remaining phases of the Pocket Philosopher rebuild.

### Task 1: AI Telemetry Rollout
- Goal: Capture full latency, token, and retrieval metrics for every AI request.
- References: docs/build-plan/tasks/analytics-observability-and-security/tasks.md, docs/build-plan/tasks/analytics-observability-and-security/ai-telemetry.md, docs/analytics/posthog-dashboards.md.
- Actions:
  1. Ensure orchestrator flows emit i_chat_completed, i_request_failed, and i_provider_health_changed with complete payloads, including failover metadata.
  2. Propagate provider statistics through getProviderStatistics into /api/health, updating snapshot tests as needed.
  3. Refresh PostHog schema docs and confirm dashboards visualize a successful end-to-end session.
- Done When: Telemetry events reflect accurate counts in PostHog, /api/health exposes synchronized provider stats, and lint/type/test pipelines pass.

### Task 2: Provider Abstraction Hardening
- Goal: Finalize the provider interface with robust failover and embedding coverage.
- References: docs/build-plan/tasks/ai-and-knowledge-system/tasks.md, docs/build-plan/tasks/ai-and-knowledge-system/provider-abstraction.md.
- Actions:
  1. Implement remaining embedding handlers or graceful fallbacks for Anthropic/Ollama with clear telemetry.
  2. Validate priority ordering, degraded-mode transitions, and health cache TTLs via targeted Jest tests.
  3. Document per-provider environment expectations and error semantics.
- Done When: Registry selection is vendor-agnostic, health transitions emit accurate telemetry, and smoke tests cover failure scenarios.

### Task 3: Retrieval and Persona Pipeline
- Goal: Deliver the hybrid RAG utilities and persona-aware prompts powering Marcus.
- References: docs/build-plan/tasks/ai-and-knowledge-system/tasks.md (Phases 2-3).
- Actions:
  1. Build retrieval modules combining pgvector similarity, keyword filters, and semantic reranking.
  2. Add caching for retrieval results and prompt payloads tuned for streaming latency.
  3. Finalize persona metadata, prompt templates, and output normalization covering citations, micro-actions, and tone checks.
- Done When: The /api/marcus stream includes validated citations, persona adherence is covered by automated checks, and retrieval latency meets staging targets.

### Task 4: PWA and Offline Readiness
- Goal: Complete frontend Phase 4 polish around design-system documentation, motion, and offline workflows.
- References: docs/build-plan/tasks/frontend-architecture-and-user-experience/tasks.md (Phase 4).
- Actions:
  1. Expand shadcn/ui component documentation with tokens, variants, and usage guidance.
  2. Layer accessible animations and focus states using Framer Motion without exceeding performance budgets.
  3. Configure a Workbox service worker, install prompts, and offline sync flows for dashboard data and drafts.
- Done When: Lighthouse PWA checks pass, offline edits persist on reconnect, and component docs cover shared patterns.

### Task 5: Deployment and Operations Enablement
- Goal: Produce repeatable deployment guides, runbooks, and tooling parity.
- References: docs/build-plan/tasks/deployment-and-operations/tasks.md, docs/deployment/local-onboarding.md.
- Actions:
  1. Finalize Docker Compose parity across Next.js, Supabase, and optional Redis/Ollama, updating onboarding docs accordingly.
  2. Draft staging and production rollout guides covering secrets, migrations, backups, and rollback procedures.
  3. Author observability runbooks and release checklists aligned with new telemetry.
- Done When: A new engineer can follow documentation to provision staging, run smoke tests, and promote a release without additional tribal knowledge.

## Working Agreements
- Keep files ASCII-only and uphold npm run lint, npm run typecheck, npm run test, and npm run e2e as regression gates.
- Coordinate schema and index decisions with the backend team before altering query shapes.
- Surface blockers in the daily stand-up log for prioritization adjustments.
