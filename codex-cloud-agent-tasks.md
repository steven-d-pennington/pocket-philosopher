# Cloud Agent Task Brief

## Project Snapshot
Pocket Philosopher is a Next.js 14 (App Router) rebuild backed by Supabase. The repo already includes:

- Environment validation for all AI providers (lib/env-validation.ts).
- A streaming OpenAI client (lib/ai/providers/openai.ts).
- Core Supabase schema (database/schema.sql) and seed data (supabase/seed.sql).
- Recent backend analytics wiring (practice APIs emit PostHog events via lib/analytics/server.ts).

## Mission — AI & Knowledge System Phase 1
Deliver the provider abstraction layer so multiple AI vendors can be orchestrated behind a single interface.

### 1. Unified Service Contracts
- Create lib/ai/types.ts defining shared TypeScript interfaces for:
  - Chat/completion requests (message roles, streaming flag, token limits, model hints).
  - Embedding requests/responses.
  - Provider health status (latency, error metadata, last-checked timestamp).

### 2. Provider Client Implementations
- Extend lib/ai/providers/ with new modules for Anthropic, Together, and Ollama modeled after openai.ts.
- Each client should expose:
  - createChatStream (matching the new interface, returning stream + usage info).
  - createEmbedding when supported (Ollama can have a TODO placeholder if embeddings aren’t available yet).
  - checkHealth returning uptime/latency/error state.
- Use env from lib/env-validation.ts for configuration and throw descriptive errors when keys are missing.

### 3. Provider Registry & Failover Logic
- Add lib/ai/provider-registry.ts that:
  - Registers available providers with priorities/weights.
  - Selects an active provider per capability (chat/embedding) with graceful degradation when one fails health checks.
  - Caches health responses for a short TTL (˜30s) to reduce API pressure.
  - Emits analytics via serverAnalytics.capture (events like i_provider_health_changed, i_request_failed).

### 4. Documentation
- Create docs/build-plan/tasks/ai-and-knowledge-system/provider-abstraction.md summarizing architecture decisions, health-cache behavior, and configuration requirements.
- Note outstanding TODOs (e.g., real embeddings for Ollama, token accounting improvements).

## Constraints
- Stick to existing project patterns (fetch API, AbortController, streaming with ReadableStream).
- Keep files ASCII-only; comment sparingly when clarity helps future readers.
- Do not modify the recently updated backend analytics wiring or Supabase docs.

## Success Criteria
- New modules compile and pass TypeScript checks.
- Providers guard against missing configuration and mirror the error-handling style in openai.ts.
- Registry skips unhealthy providers automatically and records analytics events for failover.
- Documentation clearly explains how to extend the provider list in future.

## Handoff
- Commit changes to a feature branch and report back once ready so local logging work can integrate with the new registry.
