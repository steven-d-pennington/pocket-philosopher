# Cloud Agent Task Brief — AI Telemetry Expansion

## Project Snapshot
Pocket Philosopher now has a shared AI provider abstraction (lib/ai/provider-registry.ts) and a request-scoped logger plus server-side analytics helper (lib/logging/logger.ts, lib/analytics/server.ts). The orchestrator continues to use OpenAI directly while providers for Anthropic, Together, and Ollama are available through the registry.

## Mission
Instrument AI usage metrics end-to-end so we can understand latency, token consumption, and provider selection across the stack.

### 1. Orchestrator Integration
- Update lib/ai/orchestrator.ts to pull its chat streams via getActiveChatProvider rather than importing OpenAI directly.
- Emit structured metrics for every request using the new logging + analytics helpers:
  - Log start/end timestamps, provider ID, latency, token counts, and whether the registry fell back to a degraded provider.
  - Capture a PostHog event (e.g., i_chat_completed) with the same properties.
- Ensure the existing CoachStreamChunk/CoachStreamResult shape still works for streaming responses.

### 2. Provider Registry Metrics
- Extend ecordProviderFailure and health evaluation to include timing and failure codes where available.
- Add a lightweight in-memory counter (per provider) tracking successes/failures in the current process lifetime; expose a getter so /api/health can surface these statistics.

### 3. API Health Endpoint
- Enrich pp/api/health/route.ts to call the new provider stats getter and include:
  - current provider ID selected by the registry (if cached),
  - success/failure counters per provider,
  - timestamp of the last health check for each provider.
- Keep the correlation ID logging pattern intact.

### 4. Documentation
- Create docs/build-plan/tasks/analytics-observability-and-security/ai-telemetry.md summarizing the new metrics, event names, and how to query them in PostHog.

## Constraints
- Do not regress existing streaming behavior or the health cache logic.
- Avoid introducing new external dependencies.
- Maintain ASCII-only files and the current lint/typecheck standards (
pm run lint, 
pm run typecheck).

## Success Criteria
- Orchestrator streams through the registry with telemetry emitted on success and failure paths.
- /api/health reports per-provider success/failure counts and last-checked timestamps.
- PostHog receives i_chat_completed and i_provider_health_changed/i_request_failed events with richer payloads.
- Documentation clearly enumerates the new metrics for other teams.

Deliver on a branch and ping once ready for integration.
