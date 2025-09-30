# AI & Knowledge System — Task Plan

## Phase 1: Provider Abstraction Layer ✅ COMPLETE
1. ✅ Design the unified AI service interface covering completion, streaming, embedding, and health checks with TypeScript contracts.
2. ✅ Implement provider clients for OpenAI, Anthropic, Together, and Ollama, including configuration-driven model selection.
3. ✅ Add provider health caching, failover thresholds, and telemetry hooks to enable dynamic degradation logic. [P]

## Phase 2: Retrieval-Augmented Generation Stack ✅ COMPLETE
1. ✅ Stand up hybrid retrieval utilities leveraging pgvector search, keyword filtering, and semantic reranking.
2. ✅ Implement caching strategies (in-memory and optional Redis) for retrieval results, prompt payloads, and provider health. [P]
3. ✅ Build citation validation and formatting pipelines to ensure referenced texts meet quality criteria. [P]

## Phase 3: Persona & Prompt Architecture ✅ COMPLETE
1. ✅ Define persona metadata (voice, virtues, prompts, constraints) and register them within the AI service.
2. ✅ Create system prompt templates and user-context assembly functions merging practices, reflections, and virtue focus.
3. ✅ Enforce output formatting rules that include acknowledgements, insights, micro-actions, and citations across personas.

## Phase 4: Conversation Workflow & Persistence ✅ COMPLETE
1. ✅ Implement the `/api/marcus` streaming flow, including cache lookups, context enrichment, and SSE/ReadableStream responses.
2. ✅ Persist conversations, messages, citations, and provider metadata in Supabase, ensuring ordering and retention policies. [P]
3. ✅ Emit telemetry events capturing latency, tokens, retrieval counts, and provider usage for observability dashboards. [P]

## Phase 5: Corpus Management Toolkit ✅ COMPLETE
1. ✅ Build ingestion scripts to normalize philosophy texts, chunk content, and generate embeddings for storage.
2. ✅ Implement administrative endpoints for ingestion status, forcing re-ingestion, and monitoring corpus health.
3. ✅ Document operations playbooks for maintaining and expanding the philosophy corpus across traditions.

