# PostHog Dashboard Seeds

This document outlines the core telemetry events captured by the AI orchestration layer and suggests dashboard widgets that help monitor provider behaviour, latency, and failover patterns.

## Core Events

### `i_chat_completed`
- **When**: Emitted after a coach session streaming request successfully finalises.
- **Key properties**:
  - `providerId` – identifier of the selected chat provider.
  - `providerStatus` – health status (`healthy` or `degraded`) at the time of selection.
  - `failoverCount` – number of fallback attempts before the final provider responded.
  - `degradedMode` – boolean flag showing whether a degraded provider handled the request.
  - `latencyMs` – total request latency from submission to completion.
  - `tokensPrompt`, `tokensCompletion`, `tokensTotal` – token counts (null-safe).
  - `fallbackUsed`, `attempts` – metadata describing the evaluation pipeline.
  - `knowledgeChunks`, `historyTurns` – contextual payload sizes for correlation.

### `i_request_failed`
- **When**: Emitted whenever a provider stream fails to initialise or errors mid-stream.
- **Key properties**:
  - `providerId` – provider that raised the error.
  - `durationMs` – elapsed time before the failure surfaced.
  - `errorCode` and `message` – sanitized diagnostic information.
  - Additional metadata passed by the orchestrator (e.g., failure stage, fallback usage, `failoverCount`, and the evaluated `attempts`).

### `i_provider_health_changed`
- **When**: Triggered when a provider’s health state transitions (healthy ↔ degraded/unavailable).
- **Key properties**:
  - `providerId`
  - `previousStatus` / `currentStatus`
  - `latencyMs` and `checkedAt` from the last health probe.
  - `errorMessage` / `errorCode` if supplied by the health check.

### Suggested auxiliary events
- `i_provider_health_snapshot` (optional) – batch capture of `getProviderStatistics()` output if periodic snapshots are required for long-term trending.
- `client_offline_event` – emitted by the service worker provider to track install prompts, offline transitions, and draft queue usage (`action` property enumerates events such as `offline`, `online`, `draft_queued`, `draft_synced`).

## Dashboard Blueprint

1. **Provider Latency Histogram**
   - Chart `latencyMs` from `i_chat_completed`.
   - Segment by `providerId` and `degradedMode` to spot regressions.

2. **Provider Selection Pie Chart**
   - Use `i_chat_completed` events.
   - Slice by `providerId` to understand distribution of routing decisions.
   - Add a secondary view grouped by `fallbackUsed` to monitor failover pressure.

3. **Failover Timeline**
   - Line chart over time using `failoverCount` aggregated daily.
   - Combine with `i_request_failed` counts to correlate spikes.

4. **Health Status Table**
   - Feed from `i_provider_health_changed` (and optional snapshot events).
   - Display current `status`, `successes`, `failures`, `degraded` counters, and `lastLatencyMs` from `getProviderStatistics()`.

5. **Error Drill-down**
   - Utilize `i_request_failed`.
   - Break down by `errorCode` and `providerId` to quickly identify systemic outages.

## Feature Flags & Environment Dependencies

- **PostHog ingestion** – requires `POSTHOG_PROJECT_API_KEY` and `POSTHOG_HOST` to be configured in the environment. The analytics client no-ops when disabled.
- **Provider credentials** – `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `TOGETHER_API_KEY`, and `OLLAMA_URL` affect which providers surface in telemetry. Missing credentials will appear as `missing` in `/api/health`.
- **Degraded-mode routing** – ensure any feature flag controlling provider priority weights is documented alongside the dashboards if custom routing toggles exist.

Use this document as a seed when creating or updating PostHog dashboards so that observability improvements remain consistent across environments.
