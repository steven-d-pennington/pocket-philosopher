# Provider Abstraction Layer

## Overview
The provider registry introduces a unified contract for chat and embedding workloads so that Pocket Philosopher can orchestrate multiple AI vendors behind a single interface. Providers implement shared request/response types from `lib/ai/types.ts` and are registered with priorities to enable graceful failover. Analytics events are emitted when provider health changes or when downstream requests fail, allowing us to monitor reliability regressions without touching the call sites.

## Architecture Decisions
- **Shared contracts** – `lib/ai/types.ts` now defines message, streaming, embedding, and health interfaces used by all vendors and the registry. Each provider returns the same `AIChatStreamResult` shape (async generator plus deferred usage) so orchestrators can remain vendor-agnostic.
- **Provider clients** – Implementations for OpenAI, Anthropic, Together, and Ollama live in `lib/ai/providers/`. They lean on the Fetch API, `AbortController`, and SSE/NDJSON parsing to deliver streamed responses. Clients guard against missing environment configuration and raise descriptive errors when keys or URLs are absent. Embeddings are implemented for OpenAI and Together; Anthropic and Ollama expose TODO placeholders until first-party APIs are available.
- **Registry orchestration** – `lib/ai/provider-registry.ts` maintains ordered provider lists for chat and embeddings. Providers are sorted by priority (ascending) and weight (descending) so the system will select the highest-priority healthy vendor, fall back to degraded options, and finally use the first registered provider if every check fails.
- **Health caching** – Health checks are cached for 30 seconds to avoid spamming vendor APIs. Cached entries are invalidated automatically after the TTL and refreshed on demand. Analytics events (`i_provider_health_changed`) fire whenever a provider transitions between health states, enabling alerting when a vendor drops from healthy to degraded/unavailable.
- **Failure instrumentation** – The registry exposes `recordProviderFailure` which callers can use when an invocation fails. Events are captured as `i_request_failed` with provider metadata so we can analyze incident frequency.

## Configuration Requirements
- **OpenAI** – Requires `OPENAI_API_KEY`. Both chat and embeddings are supported. Health checks hit the `/v1/models` endpoint.
- **Anthropic** – Requires `ANTHROPIC_API_KEY`. Chat streaming is available via the Messages API. Embeddings are not yet supported; attempts will throw with a TODO message. Health checks query `/v1/models`.
- **Together** – Requires `TOGETHER_API_KEY`. Chat and embeddings mirror OpenAI’s payload contract. Health checks query `/v1/models`.
- **Ollama** – Requires `OLLAMA_URL` pointing at the Ollama daemon. Chat streaming consumes NDJSON responses from `/api/chat`. Embeddings are a TODO placeholder until upstream support lands. Health checks call `/api/tags` on the configured host.

Ensure the relevant environment variables are set before enabling a provider; missing configuration is treated as an unavailable health state so the registry will skip that provider until it is configured.

## Outstanding TODOs
- Replace the Ollama embedding placeholder once the upstream API exposes vectors.
- Monitor Anthropic’s roadmap for native embeddings and update the client when available.
- Improve token accounting once vendor usage semantics stabilize (e.g., unify prompt/completion token naming across providers).
- Consider persisting provider health snapshots if we need historical uptime reporting beyond the in-memory cache.
