# Provider Registry Reference

This document summarizes environment variables, supported capabilities, and error semantics for each AI provider registered with Pocket Philosopher.

## Chat Providers

| Provider | Env Requirements | Default Model | Notes |
| -------- | ---------------- | ------------- | ----- |
| OpenAI | `OPENAI_API_KEY` | `gpt-4o-mini` | Primary chat provider; prioritized for latency and quality. |
| Anthropic | `ANTHROPIC_API_KEY` | `claude-3-haiku-20240307` | Secondary fallback; supports streaming via `/v1/messages`. |
| Together AI | `TOGETHER_API_KEY` | `mistral-7b-instruct` | Community fallback; higher latency expected. |
| Ollama | `OLLAMA_URL` | Configured per model | Local-only provider. Requires the Ollama container or host daemon. |

## Embedding Providers

| Provider | Env Requirements | Default Model | Failure Handling |
| -------- | ---------------- | ------------- | ---------------- |
| OpenAI | `OPENAI_API_KEY` | `text-embedding-3-small` | Records failures with `stage: createEmbedding` metadata and attempts list. |
| Together AI | `TOGETHER_API_KEY` | `togethercomputer/m2-bert-80M-light` | Marked degraded when latency exceeds 200ms; falls back to Anthropic. |
| Anthropic | `ANTHROPIC_API_KEY` | `claude-embed-v1` | Returns actionable error when embeddings are not enabled for the account (`status` 404/501). |
| Ollama | `OLLAMA_URL` | configured per request | Requires recent Ollama build; 404 responses imply embeddings not enabled. |

## Telemetry Semantics

- All providers emit `i_request_failed` with `failoverCount` and `attempts` metadata on failure.
- Successful operations update runtime counters which surface via `/api/health` and PostHog dashboards.
- Health checks cache for 30 seconds; status transitions trigger `i_provider_health_changed` with previous/current states.

## Troubleshooting

1. **Missing API Keys**
   - Provider health will report `status: unavailable` with `error.code = missing_api_key`.
   - Resolve by populating the required environment variable and restart the app.
2. **Persistent Failures**
   - Check PostHog for repeated `stage: createChatStream` or `stage: createEmbedding` failures.
   - Use `npm run test -- __tests__/provider-registry.test.ts` to confirm the health cache logic is intact.
3. **Local Ollama**
   - Ensure the Ollama service exposes embeddings (`/api/embeddings`). Older builds may return 404; upgrade to the latest release.

Keep this document aligned with the registry bootstrap in `lib/ai/provider-registry.ts` whenever providers or models change.
