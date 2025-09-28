# Cloud Agent Task Brief — AI Telemetry & Observability v3

## Context Snapshot
- Provider registry (lib/ai/provider-registry.ts) and new providers (OpenAI, Anthropic, Together, Ollama) are live.
- API routes now emit structured logs with X-Request-ID; PostHog capture helpers exist in lib/analytics/server.ts.
- Orchestrator (lib/ai/orchestrator.ts) still calls OpenAI directly and only logs minimal usage data.
- /api/health reports Supabase/analytics state but does not surface provider-level telemetry yet.

## Mission
Deliver end-to-end AI telemetry, registry instrumentation, and dashboards so we can inspect provider behaviour, latency, and token usage in real time.

### 1. Orchestrator ? Registry Integration
- Route coach streams through getActiveChatProvider / getActiveEmbeddingProvider instead of calling OpenAI directly.
- Maintain streaming semantics (ReadableStream + chunk piping) while wiring the selected provider ID into logs and analytics events.
- Emit a PostHog event (i_chat_completed) after each request with: provider ID, latency, completion tokens, prompt tokens, failover count, and whether degraded mode was used.

### 2. Provider Registry Telemetry
- Extend ecordProviderFailure and health checks to accumulate in-memory counters: successes, degraded responses, outright failures.
- Cache last successful latency per provider.
- Expose a new helper getProviderStatistics() returning { providerId, status, successes, failures, degraded, lastLatencyMs, lastCheckedAt }.

### 3. API Health Enrichment
- Update /api/health to include provider statistics from the helper above.
- Add structured logging for provider health lookups (INFO on success, WARN on degraded/unavailable).
- Ensure the response still respects the existing schema (status + dependencies) while appending iProviders telemetry details.

### 4. PostHog Dashboard Seeds
- Create a JSON or markdown instructions file under docs/analytics/posthog-dashboards.md that documents:
  - Event names and properties (i_chat_completed, i_provider_health_changed, i_request_failed, etc.).
  - Suggested PostHog dashboard widgets (latency histogram, provider selection pie chart, failover counter).
  - Any feature flag or environment variable dependencies.

### 5. Regression & Smoke Tests
- Add Jest smoke tests around the provider registry health cache (+ provider stats helper).
- Snapshot test the health endpoint payload shape using mocked provider stats.
- Ensure 
pm run typecheck, 
pm run lint, and 
pm run test -- --passWithNoTests remain green.

## Constraints
- Do not introduce new runtime dependencies.
- Keep telemetry payloads ASCII-friendly and privacy-safe (no raw user content).
- New tests should run quickly (<2s) and rely on dependency injection/mocking rather than network calls.

## Deliverables
- Updated orchestrator, provider registry, health route, and analytics helper.
- New docs file (docs/analytics/posthog-dashboards.md).
- New Jest tests covering registry telemetry helpers and health endpoint payloads.
- Verification log showing lint/typecheck/tests passing.

Ping once the branch is ready so local work can consume the richer telemetry.
