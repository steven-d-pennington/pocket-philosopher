# AI & Knowledge System Specification

This guide explains how to reconstruct the Pocket Philosopher coaching system (multiple personas including Marcus the Stoic), including provider abstraction, retrieval-augmented generation (RAG), and observability requirements.

## 1. Objectives
- Deliver context-aware philosophical coaching grounded in authentic texts across multiple traditions (Stoic, Taoist, Existentialist, etc.).
- Support multiple AI providers with seamless failover.
- Surface citations, quotes, and actionable guidance tailored to the user’s virtue focus, active persona, recent activity, and conversation history.

## 2. System Components
```
lib/ai/
  providers/            -> Provider clients (OpenAI, Anthropic, Together, Ollama)
  services/             -> High-level Pocket Philosopher orchestrator
  rag/                  -> Core retrieval logic (vector search, scoring, reranking)
  retrieval/            -> Hybrid search utilities (vector + full-text)
  cache/                -> Multi-tier cache (in-memory + Redis placeholder)
  citations/            -> Citation formatter and validator
  prompts/              -> System & persona prompt templates
  personas/             -> Persona definitions for philosophy themes (Marcus, Lao, Simone, etc.)
  config/               -> Provider priority, failover thresholds, rate limits
  monitoring/           -> Metrics emission, health checks
  evaluation/ & testing/-> Quality evaluation harness and regression suites
```

### Provider Abstraction
- `aiService` exposes a unified interface (`complete`, `stream`, `embed`, `getHealthStatus`).
- Providers register capability metadata (supports streaming? embeddings? max tokens). Priority order defined in `config/providers.ts` with dynamic degradation based on latency/error thresholds.
- Failover logic attempts providers in priority order; caches health metrics for short-lived backoff.

### Retrieval-Augmented Generation
- Philosophy corpora stored in PostgreSQL with pgvector (see `database/migrations/003_rag_system.sql`).
- `rag-service.ts` orchestrates:
  1. Retrieve relevant chunks via hybrid search (`vectorSearch` + keyword filter) scoped to active persona’s tradition plus universal guidance.
  2. Compose contextual prompt combining user state (virtue focus, recent reflections, selected persona), conversation history, and retrieved text with citations.
  3. Invoke AI provider with streaming support, capturing tokens and metadata.
  4. Post-process response to attach citations, highlight actionable micro-steps, and store transcripts.
- Retrieval modes include vector-only, text-only, hybrid, semantic rerank; configurable per request.

### Caching Strategy
- `globalCache` provides in-memory caching for prompt results, ingestion status, and provider health.
- Optional Redis layer (configurable) for multi-instance deployments; fallback to in-process cache when absent.
- Cache keys derived from hashed prompts + persona + user context using `createCacheKey`.
- Coach chat requests check cache for identical user prompts within short time window to reduce duplicate token usage.

## 3. Conversation Workflow
1. **Request Intake (`/api/marcus`):** Receives message, validates payload, ensures provider availability, and loads conversation metadata from Supabase (route name retained for legacy compatibility).
2. **Context Assembly:**
   - Fetch latest habits (status, virtue assignments) and reflections to enrich `PhilosophyContext` object.
   - Determine persona via `getAIPersona` based on selected philosophy.
   - Include system prompt from `getSystemPrompt` plus conversation history trimmed to fit token budget.
3. **Retrieval:** Execute `PhilosophyRetriever` with query expansion; optionally include philosophy-specific focus (e.g., Epictetus emphasis on discipline, Laozi emphasis on harmony).
4. **Generation:** Call `aiService.streamCompletion` (or similar) to receive token stream.
5. **Streaming Response:**
   - Tokens streamed to client via Server-Sent Events or Next.js `ReadableStream`.
   - `streaming-store` updates UI incrementally; citations appended once response complete.
6. **Persistence:** Store assistant message, persona id, citations, and provider metadata in `marcus_messages`; update `marcus_conversations.updated_at`.
7. **Telemetry:** Log `ai_events` style record (table pending) capturing provider, model, latency, tokens, retrieved chunk count.

## 4. Corpus Management
- **Source Texts:** Stoic classics (Meditations, Enchiridion, Discourses), Taoist works (Tao Te Ching, Zhuangzi excerpts), Existentialist essays, and curated modern commentary in `lib/ai/corpus`.
- **Metadata:** Each chunk records work, author, reference (e.g., “Book 2, Section 1”), virtues, persona traditions, themes, and priority.
- **Ingestion Pipeline:**
  - Normalize text, split into semantic chunks using heuristics (sentence boundaries, max token count ~400).
  - Generate embeddings via OpenAI `text-embedding-3-small` (configurable) per corpus; include tradition label in payload.
  - Store in Supabase `stoic_chunks` table (legacy name; treat as philosophy corpus) with vector column and full-text search index.
  - Track ingestion status in `ai_ingestion_status` (if present) or local cache.
- **Maintenance:** Provide re-ingestion endpoint (`POST /api/ai/ingest` with `force: true`) and status endpoint (`GET /api/ai/ingest`).

## 5. Prompt Design
- **System Prompt:** Emphasizes empathetic philosophical mentor persona aligned with selected tradition, actionable advice, citations, and caution against medical/legal claims.
- **Persona Layers:** Each philosophy persona adjusts tone, focus virtues, and default suggestions. Example attributes: `voice`, `tradition`, `coreVirtues`, `signaturePractices`, `conversationOpeners`.
- **User Instructions:** Include user’s virtue focus, current challenges (from onboarding), recent reflection highlights, and outstanding habits.
- **Output Format:** Response typically contains:
  - Short acknowledgement.
  - Philosophical insight referencing retrieved quote(s).
  - 2-3 micro-actions aligned with virtue focus.
  - Citations list referencing original texts (work + section).

## 6. Error Handling & Fallbacks
- Detect provider outages via `getHealthStatus`; surface friendly error message (“Your philosopher is momentarily unavailable”).
- If retrieval fails, fall back to cached daily prompt or persona-specific heuristics.
- When citations cannot be validated, flag message for review and exclude unreliable references.
- Rate limiting prevents prompt spam; repeated failures degrade persona to lighter-weight provider (e.g., switch from GPT-4o to GPT-3.5 equivalent).

## 7. Observability & Evaluation
- **Metrics:** Collect latency (p50/p95/p99), token usage, provider error rate, cache hit rate, retrieval count.
- **Logging:** Structured logs with event type (`qa`, `daily_prompt`), provider, model, conversation ID, persona.
- **Evaluation Harness:** `lib/ai/evaluation` includes dataset of prompts and expected attributes (citations, tone, persona adherence). Run regression checks before deploying new prompt templates or provider settings.
- **Testing:** Unit tests for prompt builders, retrieval ranking, persona switching, and cache key generation; integration tests that mock provider responses.

## 8. Rebuild Steps
1. Implement provider clients adhering to shared interface; configure priority and failover.
2. Recreate Supabase tables for corpus (`stoic_chunks`) and conversation history (`marcus_*`).
3. Build ingestion pipeline to chunk texts, generate embeddings, and store metadata.
4. Implement retrieval utilities combining vector + keyword search with filters for virtue, author, work.
5. Recreate Pocket Philosopher service orchestrating context assembly, prompt composition, persona routing, and streaming responses.
6. Integrate API route `/api/marcus` with authentication, rate limiting, persona selection, and persistence logic.
7. Add metrics and health check endpoints to monitor provider status and ingestion progress.
