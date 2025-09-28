# AI Telemetry

## Overview
The AI orchestrator and provider registry now emit structured telemetry so we can track request latency, token consumption, and provider health. Logging uses the request-scoped logger while analytics events are delivered to PostHog through `serverAnalytics`.

## Orchestrator Metrics
- **Log entries**: `createCoachStream` logs provider selection and completion with metadata including provider ID, fallback usage, latency, and token counts.
- **PostHog event**: `i_chat_completed`
  - Distinct ID: authenticated user ID
  - Properties:
    - `providerId`, `providerStatus`
    - `personaId`
    - `fallbackUsed` (boolean, encoded as 0/1)
    - `latencyMs`, `startedAt`, `completedAt`
    - `tokensPrompt`, `tokensCompletion`, `tokensTotal`
    - `attempts` (JSON payload summarising provider selection order)
    - `knowledgeChunks`, `historyTurns`
- **Failure handling**: stream failures or setup errors invoke `recordProviderFailure`, emitting `i_request_failed` with duration and provider metadata. Successes increment in-memory counters via `recordProviderSuccess`.

## Provider Registry Metrics
- **Health transitions**: `i_provider_health_changed` fires when a provider shifts between `healthy`, `degraded`, or `unavailable`. Payload includes latency, timestamp, and any error codes.
- **Request failures**: `i_request_failed` now captures `durationMs`, `errorCode` (when available), and contextual metadata.
- **Runtime counters**: Each provider maintains process-lifetime `successCount`, `failureCount`, plus timestamps for the most recent success/failure.
- **Diagnostics API**: `getChatProviderDiagnostics()` exposes the counters and cached health snapshots (status, last check timestamp, latency, last error).

## `/api/health` Enhancements
The health endpoint now returns:
- `aiProviders.configuration`: configuration status for each known provider.
- `aiProviders.selection`: last selected provider ID, health status, fallback indicator, and timestamp.
- `aiProviders.stats`: per-provider object with success/failure counts, last success/failure timestamps, last health check timestamp, latency, and last error information.

## PostHog Queries
- **Chat performance**: query the `i_chat_completed` event, filter by `personaId` or `providerId`, and chart `latencyMs` or `tokensTotal` to monitor response trends.
- **Fallback detection**: filter `i_chat_completed` where `fallbackUsed = 1` to see when degraded providers served traffic.
- **Provider reliability**: monitor `i_request_failed` grouped by `providerId` and `errorCode` to identify noisy integrations.
- **Health volatility**: visualize `i_provider_health_changed` transitions to spot providers flapping between states.

These metrics allow reliability, analytics, and security teams to trace AI behaviour end-to-end without introducing external dependencies.
